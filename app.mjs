import fs from 'fs';
import { google } from 'googleapis';
import { Command } from 'commander';
const program = new Command();

/**
 * Define command line options.
 */
program
  .requiredOption('-o, --output <string>', 'Output directory path (root_out)')
  .requiredOption('-f, --folder <string>', 'Starting folder ID (startingFolderId)')
  .option('-k, --keyfile <string>', 'Service Account Key file to use. Pass the file name only. Expected in the ./secrets directory.')
  .option('-s, --silent', 'Only logs errors')
  .option('-u, --update-tolerance <number>', 'Determines the time difference, in seconds, when a file is considered updated on Google Drive. If a remote file and a local file have a time difference in excess of this tolerance, it\'s considered updated.')
  .description('Export Google Docs, Sheets, and Slides to Microsoft Office formats and PDF.')
  .showHelpAfterError(true)
  .parse(process.argv);

// Get the command line options
const options = program.opts();
// Set the root output directory from the command line options (default is './out')
const root_out = options.output || './out';
// Set the starting folder ID from the command line options
const startingFolderId = options.folder;
// Set silent mode if the option was passed
const silent = options.silent;
// Set the update tolerance if the option was passed
const updateTolerance = parseInt(options.updateTolerance) || 60; // Default to 60 seconds

// Set the path to your service account JSON key file
const SERVICE_ACCOUNT_KEY_FILE = `./secrets/${options.keyfile}` || './secrets/serviceAccountKey.json';

// Create a JWT client using the service account key file
const auth = new google.auth.GoogleAuth({
  keyFile: SERVICE_ACCOUNT_KEY_FILE,
  scopes: ['https://www.googleapis.com/auth/drive.readonly'],
});

// Create a Drive client
const drive = google.drive({ version: 'v3', auth });

// Graceful exit on Ctrl+C
process.on('SIGINT', () => {
  console.log('Received Ctrl+C signal. Exiting gracefully...');
  process.exit(0);
});

/**
 * Run the main function.
 */
main();

/**
 * Main function, which starts with root_out and the passed startingFolderId.
 *
 * @returns {Promise<void>}
 */
async function main() {
  console.log(`google-drive-export starting export to '${root_out}'...`)
  await listFiles(startingFolderId, root_out);
}

/**
 * Exports a Google Drive file to the specified directory in both a native format and PDF.
 * @param file - the file object coming from the Google Drive API
 * @param parentPath - the full drive path to directory where the file will be exported into.
 * @returns {Promise<void>}
 */
async function exportFile(file, parentPath) {
  // Just in case
  createSubDirectory(parentPath);
  // Map out the variables
  const outDir = parentPath;
  const mimeType = file.mimeType;
  const fileId = file.id;
  // Define export formats based on the mimeType
  let exportMimeType = '';
  let fileExtension = '';

  // Sort out the export formats (extension and mimeType)
  if (mimeType === 'application/vnd.google-apps.document') {
    exportMimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'; // Docx
    fileExtension = 'docx';
  } else if (mimeType === 'application/vnd.google-apps.spreadsheet') {
    exportMimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'; // Xlsx
    fileExtension = 'xlsx';
  } else if (mimeType === 'application/vnd.google-apps.presentation') {
    exportMimeType = 'application/vnd.openxmlformats-officedocument.presentationml.presentation'; // Pptx
    fileExtension = 'pptx';
  } else {
    console.error(`!!! Unsupported mimeType: ${mimeType}`);
    return;
  }

  // Define the file paths for the output files
  const nativeFilePath = `${outDir}/${file.name}.${fileExtension}`;
  const pdfFilePath = `${outDir}/${file.name}.pdf`;

  // Check if the file already exists
  if (fs.existsSync(nativeFilePath)) {
    // If it does, check if the file has been updated since the last export
    const stats = fs.statSync(nativeFilePath);
    const lastUpdateTime = stats.mtime;
    if (isWithinTimeTolerance(new Date(file.modifiedTime), lastUpdateTime)) {
      // If it has not been updated, skip it
      if (!silent) console.log(`/// SKIPPING '${nativeFilePath}'. Last updated ${lastUpdateTime}`);
      return;
    }
  }

  // Set options for the export (native export)
  const exportOptions = {
    fileId,
    mimeType: exportMimeType,
  };

  try {
    const { data } = await drive.files.export(exportOptions, { responseType: 'arraybuffer' });
    // Write the exported file with the correct extension
    fs.writeFileSync(nativeFilePath, Buffer.from(data, 'binary'));
    // Update the file's modified time to match the Google Drive file
    fs.utimesSync(nativeFilePath, new Date(file.createdTime), new Date(file.modifiedTime))
    if (!silent) console.log(`>>> Exported '${nativeFilePath}'`);
  } catch (error) {
    console.error(`!!! Error exporting file '${nativeFilePath}': ${error.message}`);
  }

  // Set options for the export (pdf)
  const pdfExportOptions = {
    fileId,
    mimeType: 'application/pdf',
  };

  try {
    const { data } = await drive.files.export(pdfExportOptions, { responseType: 'arraybuffer' });
    // Write the exported PDF
    fs.writeFileSync(pdfFilePath, Buffer.from(data, 'binary'));
    // Update the file's modified time to match the Google Drive file
    fs.utimesSync(pdfFilePath, new Date(file.createdTime), new Date(file.modifiedTime));
    if (!silent) console.log(`>>> Exported '${pdfFilePath}'`);
  } catch (error) {
    console.error(`!!! Error exporting file '${pdfFilePath}': ${error.message}`);
  }
}

function isWithinTimeTolerance(remoteModifiedTime, localModifiedTime) {
  const timeDifferenceSeconds = Math.abs(remoteModifiedTime - localModifiedTime) / 1000; // Convert to seconds
  return timeDifferenceSeconds <= updateTolerance; // Check if the time difference is less than or equal to 60 seconds (1 minute)
}

/**
 * Creates a subdirectory if it does not already exist.
 * @param directoryPath - the path to the directory to create, full path.
 */
function createSubDirectory(directoryPath) {
  try {
    if (!fs.existsSync(`${directoryPath}`)) {
      // Does not exist, create it
      fs.mkdirSync(`${directoryPath}`);
      if (!silent) console.log(`>>> Created directory '${directoryPath}'`)
    }
  } catch (error) {
    console.error(`!!! Error creating directory '${directoryPath}': ${error.message}`);
  }
}

/**
 * Lists all files in a Google Drive folder and exports them by calling a helper function.
 * Also creates subdirectories to match Google Drive subdirectories.
 * This will recurse through all subdirectories from the provided starting folder ID.
 * This is a recursive function that will call itself for each subdirectory until full-depth is reached.
 *
 * @param folderId - the Google Drive folder ID to start listing files from
 * @param parentPath - the full drive path to directory where files will be exported into.
 * @returns {Promise<void>}
 */
async function listFiles(folderId, parentPath) {
  try {
    // List all files in the folder (this will also include subdirectories)
    const { data } = await drive.files.list({
      q: `'${folderId}' in parents`,
      fields: 'files(id, name, mimeType, createdTime, modifiedTime)',
      trashed: false,
    });

    // Loop through the files and export them (or recurse if it's a subdirectory)
    for (const file of data.files) {
      // We only care about Google Docs, Sheets, and Slides, so skip everything else
      if (file.mimeType.includes('application/vnd.google-apps')) {
        if (!silent) console.log(`>>> Processing '${file.name}' (${file.mimeType})`);
        // If the current 'file' is a subdirectory, create it locally
        if (file.mimeType === 'application/vnd.google-apps.folder') {
          // Create the subdirectory, notice we trim the name to remove any whitespace
          const subDirectoryPath = `${parentPath}/${file.name.trim()}`;
          createSubDirectory(subDirectoryPath);
          // Recurse into the subdirectory using the subdirectory's ID and passing the subdirectory's path as the parentPath
          await listFiles(file.id, subDirectoryPath);
        } else {
          // If the current 'file' is actually a file, export it
          await exportFile(file, parentPath);
        }
      }
    }
  } catch (error) {
    console.error(`!!! Error listing files: ${error.message}`);
  }
}

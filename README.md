# Google Drive Export Script

This script allows you to export Google Docs, Sheets, and Slides to Microsoft Office formats (Docx, Xlsx, Pptx) and PDFs from a specific Google Drive directory. The script will recurse into Google Drive subdirectories from the starting directory ID that you specify and create a matching directory structure in the output directory.

The script uses a service account for authentication, ensuring secure access to your Google Drive files.

## Prerequisites

Before using this script, make sure you have the following prerequisites:

1. **Docker**: The recommended method for running this script is with Docker. You can download Docker Desktop or Docker CE from [docker.com](https://www.docker.com/).
   **Node.js**: Alternatively, you can install Node.js on your machine. You can download it from [nodejs.org](https://nodejs.org/). This script was tested with Node.js v18.
2. **Google Cloud Project**: You will need a Google Cloud project with the Google Drive API enabled.
3. **Service Account**: Create a service account within your Google Cloud project and generate a JSON key file for authentication. You can find instructions for creating a service account and generating a key file in the [Google Cloud documentation](https://cloud.google.com/iam/docs/creating-managing-service-account-keys). Note that a service account has an email address associated with it, which you will need to grant access to your Google Drive files.
4. **Google Drive Directory**: Identify the specific Google Drive directory that you want to export files from and note its folder ID. Then grant your service account access to the directory by using the service account email. The service account only needs VIEW permission.

## Setup for Docker (Recommended)

If using Docker, follow these steps to set up and use the script:

1. Clone or download this repository to your local machine.
2. Save your service account JSON key file to the `./secrets` directory of the project and rename it to `serviceAccountKey.json`.
3. You will customize the default output directory and starting folder ID by specifying them as command-line arguments when running the script.
   Example:
   ``` bash
   ./x-docker-run-google-drive-export.sh "./my_output_directory" "your_folder_id" "serviceAccountKey.json" silent
   ```
   (Note, you can omit the "silent" argument if you want to see the script output in the terminal.)

## Setup for NodeJS Native

If using NodeJS natively on your workstation, follow these steps to set up and use the script:

1. Clone or download this repository to your local machine.
2. Ensure you have NodeJS v18 installed then install project dependencies by running the following on the root of this repository:
   ``` bash
   npm install
   ```
3. Save your service account JSON key file to the root directory of the project and rename it to `serviceAccountKey.json`.
4. You will customize the default output directory and starting folder ID by specifying them as command-line arguments when running the script. Use the `-o` or `--output` flag to specify the output directory and the `-f` or `--folder` flag to specify the starting folder ID.
   Example:
   ``` bash
   node app.mjs --output "./my_output_directory" --folder "your_folder_id" --keyfile "serviceAccountKey.json" --silent
   ```
   (Note, you can omit the "--silent" argument if you want to see the script output in the terminal.)

## Multiple Service Accounts

You can use multiple service accounts to export files from multiple Google Drive directories. To do this, you will need to save the key file for each account into the `./secrets` directory giving each a unique name. Then you specify the service account key file to use when running the script. 

## Help and Troubleshooting

- This script was tested on macOS and Linux. For use with native NodeJS on Windows, you'll need to tweak the creation of folder paths to use Windows path separators. It's possible that file names also need to be tweaked/formatted for Windows. Alternatively, you can use Docker on Windows to run the script with the above instructions for Docker.
- If you encounter issues or have questions about using the script, you can run the script with the `--help` flag to see usage information and examples:
  ```
  node app.mjs --help
  ```
- If you need assistance with Google Cloud setup or service accounts, refer to the Google Cloud documentation.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

Happy exporting!

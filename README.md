# Google Drive Export Script

This script allows you to export Google Docs, Sheets, and Slides to Microsoft Office formats (Docx, Xlsx, Pptx) and PDFs from a specific Google Drive directory. The script will recurse into Google Drive subdirectories from the starting directory ID that you specify and create a matching directory structure in the output directory.

The script uses a service account for authentication, ensuring secure access to your Google Drive files.

## Prerequisites

Before using this script, make sure you have the following prerequisites:

1. **Node.js**: Ensure you have Node.js installed on your machine. You can download it from [nodejs.org](https://nodejs.org/).
2. **Google Cloud Project**: You will need a Google Cloud project with the Google Drive API enabled.
3. **Service Account**: Create a service account within your Google Cloud project and generate a JSON key file for authentication. You can find instructions for creating a service account and generating a key file in the [Google Cloud documentation](https://cloud.google.com/iam/docs/creating-managing-service-account-keys). Note that a service account has an email address associated with it, which you will need to grant access to your Google Drive files.
4. **Google Drive Directory**: Identify the specific Google Drive directory that you want to export files from and note its folder ID. Then grant your service account access to the directory by using the service account email. The service account only needs VIEW permission.

## Setup

Follow these steps to set up and use the script:

1. Clone or download this repository to your local machine.
2. Install project dependencies by running:
   ``` bash
   npm install
   ```
3. Save your service account JSON key file to the root directory of the project and rename it to `serviceAccountKey.json`.
4. You will customize the default output directory and starting folder ID by specifying them as command-line arguments when running the script. Use the `-o` or `--output` flag to specify the output directory and the `-f` or `--folder` flag to specify the starting folder ID.

   Example:

   ``` bash
   node app.mjs -o "./my_output_directory" -f "your_folder_id"
   ```

## Usage

- By default, the script exports files to the './out' directory. You can change the output directory using the `-o` or `--output` flag when running the script.
- The script will export files recursively from the starting folder ID specified using the `-f` or `--folder` flag.
- You can use the `-s` or `--silent` flag to run the script in silent mode, which logs only errors.

## Help and Troubleshooting

- If you encounter issues or have questions about using the script, you can run the script with the `--help` flag to see usage information and examples:

  ```
  node app.mjs --help
  ```

- If you need assistance with Google Cloud setup or service accounts, refer to the Google Cloud documentation.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

Happy exporting!

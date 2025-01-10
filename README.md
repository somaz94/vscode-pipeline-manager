# VS Code Pipeline Manager

A Visual Studio Code extension that helps you manage GitLab and Jenkins pipelines directly from your editor.

## Features

- View and manage Jenkins pipelines
  - View pipeline status
  - Trigger builds
  - View build logs
- View and manage GitLab pipelines
  - View pipeline status
  - Trigger pipelines
  - View pipeline logs
- Easy access through the VS Code activity bar

## Requirements

- Jenkins instance with API access
- GitLab instance with API access
- Valid authentication tokens for both services

## Extension Settings

This extension contributes the following settings:

* `pipelineManager.jenkins.url`: Jenkins server URL
* `pipelineManager.jenkins.username`: Jenkins username
* `pipelineManager.jenkins.token`: Jenkins API token
* `pipelineManager.gitlab.url`: GitLab server URL
* `pipelineManager.gitlab.token`: GitLab API token
* `pipelineManager.gitlab.projectId`: GitLab project ID

## Getting Started

1. Install the extension
2. Configure your Jenkins and/or GitLab credentials in VS Code settings
3. Click the Pipeline Manager icon in the activity bar
4. Start managing your pipelines!

## Known Issues

Please report issues on the [GitHub repository](https://github.com/somaz94/vscode-pipeline-manager/issues).

## Release Notes

### 0.0.1

Initial release of VS Code Pipeline Manager:
- Basic Jenkins pipeline integration
- Basic GitLab pipeline integration
- Pipeline status viewing
- Build/pipeline triggering
- Log viewing

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This extension is licensed under the [MIT License](LICENSE).
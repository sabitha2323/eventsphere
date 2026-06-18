# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

### Other setup steps

- To set up ESLint for linting, run `npx expo lint`, or follow our guide on ["Using ESLint and Prettier"](https://docs.expo.dev/guides/using-eslint/)
- If you'd like to set up unit testing, follow our guide on ["Unit Testing with Jest"](https://docs.expo.dev/develop/unit-testing/)
- Learn more about the TypeScript setup in this template in our guide on ["Using TypeScript"](https://docs.expo.dev/guides/typescript/)

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.

## 🔄 GitHub Synchronization

This project is configured with a automated and one-click GitHub synchronization workflow to ensure your code is always backed up and synchronized to [GitHub](https://github.com/sabitha2323/eventsphere).

### How to Synchronize Your Code
We have provided a custom PowerShell script `git-sync.ps1` at the root of the project to stage, commit, and push your changes safely.

**Run the synchronization script:**
Open PowerShell at the project root and run:
```powershell
.\git-sync.ps1
```
*By default, this will automatically generate a descriptive commit message based on your modified files (e.g. `chore: update 2 file(s) - index.tsx [2026-06-18 09:30]`).*

**To use a custom commit message:**
```powershell
.\git-sync.ps1 "feat: added new event details screen"
```

**To pull remote changes before pushing (highly recommended if editing on multiple machines):**
```powershell
.\git-sync.ps1 -Pull
```

### How to Verify Changes
1. Go to your GitHub repository: [sabitha2323/eventsphere](https://github.com/sabitha2323/eventsphere)
2. View the **Commits** tab or the files list to verify your changes are reflected online.
3. The sync script itself prints the exact SHA of the latest pushed commit on completion.

### Error Recovery & Troubleshooting

#### 1. Push Rejected (Non-Fast-Forward)
*   **Cause**: Someone else pushed changes to the repository, or you made changes on another device.
*   **Solution**: Run `.\git-sync.ps1 -Pull`. The script will pull the remote changes, rebase your local commits on top of them, and push automatically.

#### 2. Merge Conflicts
*   **Cause**: You edited the same lines of the same files as someone else.
*   **Solution**:
    1. Git will pause and mark the conflicts in the affected files.
    2. Open the files, locate the conflict markers (`<<<<<<<`, `=======`, `>>>>>>>`), choose the correct code, and save the files.
    3. Stage the resolved files: `git add .`
    4. Continue the rebase: `git rebase --continue`
    5. Run the sync script again: `.\git-sync.ps1`

#### 3. Authentication Failures
*   **Cause**: GitHub credentials expired or are not configured.
*   **Solution**: Open terminal/CMD and run:
    ```bash
    gh auth login
    ```
    Or configure git credentials helper:
    ```bash
    git credential-manager configure
    ```


# Claude Instructions for Daily Notes Project

## Project Rules

1. **Language**: All UI text, messages, and content must be in English
2. **Icons**: Only use flat icon style (no 3D or gradient icons)
3. **Emojis**: Avoid using emojis in the UI unless specifically requested
4. **Code Style**: Follow existing patterns in the codebase
5. **Testing**: Always run lint and typecheck commands when available
6. **Git Commits**: Do NOT add Claude as co-author in commit messages

## Technical Guidelines

- This is a React Native Expo project
- Uses TypeScript
- Custom handwritten fonts are available
- Storage is handled via AsyncStorage
- Theme system supports multiple skins (notebook, paper, dark, pink)

## UI Components

- Mood selector uses custom SVG flat emoji components
- Notes display with optional dotted borders
- Search functionality in all notes view
- Calendar view shows mood indicators

## Development Commands

```bash
npm start   # Start the development server
npm run lint   # Run linting
npm run typecheck   # Run TypeScript checks
```
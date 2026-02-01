# Voice Interview Bot 🎤

A voice-powered AI interview bot that answers questions as YOU, in first person, with your personality and background.

![Voice Bot Demo](https://img.shields.io/badge/Status-Ready%20to%20Deploy-brightgreen)

## ✨ Features

- 🎙️ **Voice Input**: Speak your questions naturally
- 🔊 **Voice Output**: Hear responses spoken aloud
- 🤖 **AI-Powered**: Uses GPT-4o-mini for intelligent, interview-ready responses
- 🎨 **Premium UI**: Dark glassmorphism design with smooth animations
- 📱 **Responsive**: Works on desktop and mobile
- ⚡ **Fast**: No page reloads, instant voice-to-voice experience

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- OpenAI API key ([Get one here](https://platform.openai.com/api-keys))

### Local Development

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment variables**:
   ```bash
   # Create .env.local file
   cp .env.example .env.local
   
   # Edit .env.local and add your OpenAI API key
   OPENAI_API_KEY=sk-your-api-key-here
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

4. **Open in Chrome/Edge**: http://localhost:3000

> ⚠️ **Browser Note**: Voice features work best in Chrome and Edge. Safari and Firefox have limited support.

## 🌐 Deploy to Vercel (Recommended)

### One-Click Deploy
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

### Manual Deploy

1. **Push to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin YOUR_GITHUB_REPO_URL
   git push -u origin main
   ```

2. **Import to Vercel**:
   - Go to [vercel.com/new](https://vercel.com/new)
   - Import your GitHub repository
   - **Add Environment Variable**:
     - Name: `OPENAI_API_KEY`
     - Value: Your OpenAI API key
   - Click **Deploy**

3. **Your bot is live!** Share the URL with anyone.

## 🎯 Customize Your Personality

Edit `lib/systemPrompt.ts` to customize:

- Your name and background
- Skills and experience
- Personality traits
- Sample responses

```typescript
// Example customization
# CORE IDENTITY
- Name: Jane Doe
- Role: Full-Stack Developer
- Background: 5 years experience in React and Node.js
```

## 📂 Project Structure

```
├── app/
│   ├── api/
│   │   └── chat/
│   │       └── route.ts      # OpenAI API integration
│   ├── components/
│   │   └── VoiceBot.tsx      # Main voice bot component
│   ├── globals.css           # Styling
│   ├── layout.tsx            # App layout
│   └── page.tsx              # Home page
├── lib/
│   └── systemPrompt.ts       # AI personality prompt
├── types/
│   └── speech.d.ts           # TypeScript declarations
└── package.json
```

## 🔧 Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14, React 18, TypeScript |
| Backend | Next.js API Routes (Serverless) |
| Speech-to-Text | Web Speech API (Free, browser-native) |
| Text-to-Speech | Web Speech Synthesis (Free, browser-native) |
| AI | OpenAI GPT-4o-mini |
| Styling | Vanilla CSS with glassmorphism |
| Deployment | Vercel |

## 💡 Example Questions

Try asking:
- "What should we know about your life story?"
- "What's your number one superpower?"
- "What are the top three areas you want to grow in?"
- "What misconception do your coworkers have about you?"
- "How do you push your boundaries and limits?"

## 🐛 Troubleshooting

### Microphone not working
- Ensure you've allowed microphone access in your browser
- Use Chrome or Edge for best compatibility

### No voice output
- Check your system volume
- Some browsers require user interaction before audio can play

### API errors
- Verify your `OPENAI_API_KEY` is correct
- Check your OpenAI account has credits

## 📄 License

MIT License - Feel free to use and modify!

---

Built with ❤️ for the 100x Assignment

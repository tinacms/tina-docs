# 🚀 TinaDocs - Your Complete Documentation Solution

> **Modern documentation made simple and powerful**

TinaDocs is a complete documentation solution built with [Tina CMS](https://tina.io/) that combines developer-friendly tools with content creator accessibility.

## ✨ Why Choose TinaDocs

### **Rich Feature Set**
- **🔍 Fast search** - Powered by Pagefind for instant content discovery
- **📊 API documentation** - Generate beautiful API docs from your OpenAPI specs
- **📑 Multi-tab interfaces** - Organize complex information with tabbed layouts
- **🎨 Custom theming** - Make your docs match your brand
- **✏️ Visual editing** - Content creators can edit directly through TinaCMS
- **📱 Responsive design** - Works great on all devices
- **⚡ Performance optimized** - Built with Next.js for fast load times

### **What Makes It Special**
- **Modern stack** - Clean, maintainable codebase
- **Developer-friendly** - Easy to customize and extend
- **Content creator-friendly** - Non-technical team members can contribute
- **SEO optimized** - Built-in best practices for search visibility

---

## 📖 How to Use TinaDocs

There are two ways you can use TinaDocs.

1. For developers – as a launching point to develops a highly custom docs solution. TinaCMS is based on markdown. Use this code as a basis to [implement custom components](https://tina.io/docs/reference/types/rendering-markdown#linking-to-react-components) to be used in MDX to fit your use case. Follow the Getting Started guide below.
2. Quickest experience – use as is and deploy in minutes via TinaCloud for a docs setup that you still hold all the keys and data for, and get to using right away.


> 💡 TinaCMS integrates tighly with GitHub, and has a powerful [editorial workflow](https://tina.io/docs/tina-cloud/editorial-workflow) based on GitHub's branch protection features.

## 🛠️ Getting Started

### **Step 1: Install Dependencies**

> 💡 We recommend `pnpm` for faster installs. [Learn why pnpm is great](https://www.ssw.com.au/rules/best-package-manager-for-node/) for Node.js projects.

```bash
pnpm install
```

### **Step 2: Start Development Server**

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to see your docs in action.

---

## 🌐 Production Setup

### **Step 3: Set Up GitHub and TinaCloud**

1. **Add your docs to GitHub**: Push your local repository to GitHub if you haven't already
2. **Create a TinaCloud account**: Sign up at [app.tina.io](https://app.tina.io)
3. **Link your repository**: Connect your GitHub repository to TinaCloud through the dashboard

### **Step 4: Configure Environment**

1. Rename `.env.example` to `.env`
2. Add your Tina credentials:

```env
NEXT_PUBLIC_TINA_CLIENT_ID=<get this from app.tina.io>
TINA_TOKEN=<get this from app.tina.io>
NEXT_PUBLIC_TINA_BRANCH=<your content branch>
```

### **Step 5: Build for Production**

```bash
pnpm build
```

---

## 🔍 Search Setup

TinaDocs includes fast search powered by [Pagefind](https://pagefind.app/), which indexes your content during the build process.

### **Step 6: Generate Search Index**

```bash
pnpm build-local-pagefind
```

The search index updates automatically with each build and is stored in `public/pagefind/`.

---

## 🚀 Deployment

### **Step 7: Deploy to Vercel** 

TinaDocs works great with Vercel. Check out our [deployment guide](https://tina.io/docs/tina-cloud/deployment-options/vercel) for detailed instructions.

---

## 📚 Learn More

- [Tina Documentation](https://tina.io/docs) - Explore Tina's full capabilities
- [Getting Started Guide](https://tina.io/docs/setup-overview/) - Quick setup walkthrough
- [GitHub Repository](https://github.com/tinacms/tinacms) - Contribute or report issues

---

**Ready to improve your documentation?** Give TinaDocs a try!

<!-- setup-skill: agent-instantiated. Ships INSIDE the static build folder (dist/) for
     web projects — written for a client/reviewer with zero technical context. Replace
     {{...}}, delete these comments. -->
# {{PROJECT_NAME}} — Concept Prototypes

This folder is a finished, self-contained copy of the prototype website. Everything it
needs is inside it — there's no database, no login, and nothing to build or install.
You only need a way to **view** it, which this guide covers.

It contains several concept directions. The starting page (`index.html`) is a simple
menu that links to each one.

---

## 1. Open it on your computer

The pages expect to be served from a web address (like `http://localhost:…`), not
opened straight from your hard drive. **Double-clicking `index.html` will look
broken** — the menu loads but links and images don't work. That's expected. Use one of
the methods below; each starts a small local web address just for you, on your own
machine.

### Easiest — double-click a launcher

- **Mac:** double-click **`start-mac.command`**
- **Windows:** double-click **`start-windows.bat`**

A small black window opens and your browser opens to the prototype automatically.
**Leave that black window open** while you browse — it's the thing serving the pages.
When you're done, close the window (or press **Control + C** in it).

> First time on Mac, you may see *"cannot be opened because it is from an unidentified
> developer."* Right-click the file → **Open** → **Open** to allow it once. (Or:
> System Settings → Privacy & Security → **Open Anyway**.)

### Manual — one command

If the launcher doesn't work, open a terminal **in this folder**:

- **Mac:** right-click the folder in Finder → *New Terminal at Folder*.
- **Windows:** in the folder's File Explorer address bar, type `cmd` and press Enter.

Then run **one** of these (whichever your machine has):

```
python3 -m http.server 8000
```

```
npx serve
```

Then open your browser to **http://localhost:8000/** (or whatever address the command
prints).

## 2. Viewing on a phone

The prototypes are responsive. For a quick look, narrow your browser window or use the
browser's device toolbar. To view on an actual phone, ask {{CONTACT_NAME}} to host the
folder or run a shared session.

## 3. Questions

Contact {{CONTACT_NAME}} ({{CONTACT_EMAIL}}). Please don't redistribute this folder —
it's an internal review artifact, not a public release.

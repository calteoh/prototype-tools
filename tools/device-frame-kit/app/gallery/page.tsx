/*
 * Gallery — a simple feed where the page itself doesn't scroll; an inner
 * overflow-y container does. The kit still collapses the Safari bar because it
 * listens for scroll on any scroller, not just the window. Text-free: a
 * heading ghost above a long two-column grid of empty boxes.
 */
export default function Gallery() {
  return (
    <div className="demo-gallery">
      <div className="demo-statusfill" />
      <div className="demo-gallery-scroller">
        <div
          className="gh gh-strong demo-gallery-heading"
          style={{ height: 18, width: 120 }}
        />
        <div className="demo-grid">
          {Array.from({ length: 32 }, (_, i) => (
            <div key={i} className="demo-grid-tile" />
          ))}
        </div>
      </div>
    </div>
  );
}

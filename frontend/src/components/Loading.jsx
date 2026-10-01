const Loading = ({ fullScreen = true, label = "Loading" }) => (
  <div className={`flex justify-center items-center ${fullScreen ? "h-screen" : "py-12"}`} role="status">
    <span className="loading loading-spinner loading-lg text-primary" aria-hidden="true" />
    <span className="sr-only">{label}…</span>
  </div>
);

export default Loading;

const Loader = ({ fullscreen = false, text = 'Loading...' }) => {
  return (
    <div className={`loader-container ${fullscreen ? 'loader-container--fullscreen' : ''}`}>
      <div className="loader">
        <div className="loader__dots">
          <div className="loader__dot" />
          <div className="loader__dot" />
          <div className="loader__dot" />
        </div>
        {text && <span className="loader__text">{text}</span>}
      </div>
    </div>
  );
};

export default Loader;

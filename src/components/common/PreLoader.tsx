// src/components/common/Preloader.tsx
import preloaderGif from '../../assets/preloader/ball.gif';

function Preloader() {
  return (
    <div className="preloader">
      <img src={preloaderGif} alt="Loading..." />
    </div>
  );
}

export default Preloader;
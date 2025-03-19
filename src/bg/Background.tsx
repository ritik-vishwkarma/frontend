import React, { useEffect } from "react";
import styles from "./BackgroundAnimation.module.css";

const BackgroundAnimation: React.FC = () => {
  useEffect(() => {
    const numIcons = 15;
    const floatingContainer = document.getElementById("floating-container");
    const animations = ["move-right", "move-left", "move-up", "move-down", "move-diagonal", "move-diagonal-reverse"];

    if (floatingContainer) {
      for (let i = 0; i < numIcons; i++) {
        const icon = document.createElement("img");
        icon.src =
          "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'><rect x='2' y='2' width='20' height='20' rx='5' ry='5'></rect><circle cx='12' cy='12' r='5'></circle><circle cx='18' cy='6' r='1.5'></circle></svg>";
        icon.classList.add(styles.floatingIcon, styles[animations[i % animations.length]]);
        icon.style.left = `${Math.random() * window.innerWidth}px`;
        icon.style.top = `${Math.random() * window.innerHeight}px`;
        floatingContainer.appendChild(icon);
      }
    }

    const numStars = 50;
    const starContainer = document.getElementById("star-container");

    if (starContainer) {
      for (let i = 0; i < numStars; i++) {
        const star = document.createElement("div");
        star.classList.add(styles.star);
        star.style.left = `${Math.random() * window.innerWidth}px`;
        star.style.top = `${Math.random() * window.innerHeight}px`;
        star.style.animationDuration = `${Math.random() * 2 + 1}s`;
        starContainer.appendChild(star);
      }
    }
  }, []);

  return (
    <div className={styles.background}>
      <div id="star-container" className={styles.starContainer}></div>
      <div id="floating-container" className={styles.floatingContainer}></div>
    </div>
  );
};

export default BackgroundAnimation;

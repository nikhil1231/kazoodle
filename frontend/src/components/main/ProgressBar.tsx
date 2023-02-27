import "./ProgressBar.css";

export const ProgressBar: React.FC<ProgressBarProps> = (
  props: ProgressBarProps
) => {
  return (
    <div className="progress-bar-base progress-bar-container">
      <div
        className="progress-bar-base progress-bar-ghost"
        style={{ width: `${props.ghostPosition}%` }}
      ></div>
      <div
        className="progress-bar-base progress-bar-fill"
        style={{ width: `${props.fillPosition}%` }}
      ></div>
      {props.sections.slice(1, props.sections.length - 1).map((s) => (
        <div
          key={s}
          className="progress-bar-divider"
          style={{
            left: `${98 * s / props.sections[props.sections.length - 1]}%`,
          }}
        ></div>
      ))}
    </div>
  );
};

interface ProgressBarProps {
  fillPosition: number;
  ghostPosition: number;
  sections: number[];
}

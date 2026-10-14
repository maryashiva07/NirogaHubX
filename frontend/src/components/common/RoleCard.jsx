import patientImage from "../../assets/images/patient.png";
import doctorImage from "../../assets/images/doctor.jpeg";

import "./RoleCard.css";

const RoleCard = ({ type, title, description, buttonText, onClick }) => {
  const image = type === "patient" ? patientImage : doctorImage;

  return (
    <article className={`role-card ${type}`}>
      {/* IMAGE */}
      <div className="role-image">
        <img src={image} alt={title} />
      </div>

      {/* CONTENT */}
      <div className="role-content">
        <div className="role-heading">
          <h3>{title}</h3>

          <span className="card-arrow">›</span>
        </div>

        <p>{description}</p>

        <button type="button" className="role-button" onClick={onClick}>
          <span>{buttonText}</span>

          <span className="button-arrow">→</span>
        </button>
      </div>
    </article>
  );
};

export default RoleCard;

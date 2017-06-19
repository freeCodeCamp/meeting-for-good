const chipFormater = (participant) => {
  let borderColor;
  let text;

  switch (participant.status) {
    case 1:
      borderColor = '3px solid #ff8080';
      text = 'Invited';
      break;
    case 2:
      borderColor = '3px solid #A0C2FF';
      text = 'Joined';
      break;
    case 3:
      borderColor = '0.5px solid #E0E0E0';
      text = 'Availability Submitted';
      break;
    default:
      break;
  }
  return { borderColor, text };
};

export default chipFormater;

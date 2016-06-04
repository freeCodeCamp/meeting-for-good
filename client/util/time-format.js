const formatTime = (value) => {
  let prefix = String(value).split(".")[0];
  let suffix = String(value).split(".")[1];
  let minutes;

  switch (suffix) {
    case "25":
      minutes = "15";
      break;
    case "5":
      minutes = "30";
      break;
    case "75":
      minutes = "45"
      break;
    default:
      minutes = "00";
      break;
  }

  if (prefix === "24") prefix = "0";

  return prefix + ":" + minutes;
}

export default formatTime;

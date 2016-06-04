const formatTime = (value) => {
  let hours = String(value).split('.')[0];
  let minutes = String(value).split('.')[1];
  let suffix = 'AM';

  switch (minutes) {
    case '25':
      minutes = '15';
      break;
    case '5':
      minutes = '30';
      break;
    case '75':
      minutes = '45';
      break;
    default:
      minutes = '00';
      break;
  }

  if (hours === '24') hours = '0';

  if (Number(hours) >= 12) {
    hours = String(Number(hours) - 12);
    suffix = 'PM';
  }

  return `${hours}:${minutes} ${suffix}`;
};

export default formatTime;

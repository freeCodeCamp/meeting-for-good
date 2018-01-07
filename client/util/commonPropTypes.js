import PropTypes from 'prop-types';

function isEvent(props, propName, componentName) {
  const propVal = props[propName];
  const validator = {
    _id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    owner: PropTypes.string.isRequired,
    active: PropTypes.bool.isRequired,
    selectedTimeRange: PropTypes.array,
    dates: PropTypes.arrayOf(PropTypes.shape({
      fromDate: PropTypes.string.isRequired,
      toDate: PropTypes.string.isRequired,
      _id: PropTypes.string.isRequired,
    })).isRequired,
    participants: PropTypes.arrayOf(PropTypes.shape({
      userId: PropTypes.shape({
        _id: PropTypes.string.isRequired,
        avatar: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
        emails: PropTypes.arrayOf(PropTypes.string).isRequired,
      }).isRequired,
      _id: PropTypes.string.isRequired,
      status: PropTypes.oneOf([0, 1, 2, 3]).isRequired,
      emailUpdate: PropTypes.bool.isRequired,
      ownerNotified: PropTypes.bool.isRequired,
      availability: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.string)).isRequired,
    })).isRequired,
  };
  return (PropTypes.checkPropTypes(validator, propVal, 'props', componentName));
}

function isCurUser(props, propName, componentName) {
  const propVal = props[propName];
  const validator = {
    _id: PropTypes.string.isRequired, // Unique user id
    name: PropTypes.string.isRequired, // User name
    avatar: PropTypes.string.isRequired, // URL to image representing user(?)
  };
  return (PropTypes.checkPropTypes(validator, propVal, 'props', componentName));
}

module.exports = { isEvent, isCurUser };

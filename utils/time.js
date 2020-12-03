exports.seconds = (sec = 1) => {
  return sec * 1000;
};
exports.minutes = (min = 1) => {
  return min * this.seconds() * 60;
};
exports.hours = (hr = 1) => {
  return hr * this.minutes() * 60;
};
exports.days = (day = 1) => {
  return day * this.hours() * 24;
};

exports.periodToDate = (period) => {
  let result;
  period = period.trim().toLowerCase();
  const date = new Date(Date.now());
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();
  const today = Date.now();
  if (period == "week") {
    result = {
      start: new Date(Date.now() - this.days(7)),
      end: new Date(today),
    };
  } else if (period == "month") {
    result = {
      start: new Date(`${year}-${month}-01`),
      end: new Date(today),
    };
  } else if (period == "year") {
    result = {
      start: new Date(`${year}-01-01`),
      end: new Date(today),
    };
  }
  return result;
};

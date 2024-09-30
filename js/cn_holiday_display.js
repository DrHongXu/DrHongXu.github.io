let recurringHolidays = [
  { date: '01-01', greeting: '🇺🇳 元旦快乐, 万事顺意!<br>', range: 5 },
  { date: '01-06', greeting: '🇨🇭 博士毕业纪念日!<br>', range: 1 },
  { date: '01-06', greeting: '🇪🇺 三王节!<br>', range: 1 },
  { date: '03-08', greeting: '🇺🇳 国际妇女节<br>', range: 1 },
  { date: '05-01', greeting: '🇺🇳 劳动节快乐!<br>', range: 1 },
  { date: '06-01', greeting: '🇺🇳 儿童节快乐!<br>', range: 1 },
  { date: '08-01', greeting: '🇨🇭 瑞士国庆日!<br>', range: 1 },
  { date: '07-14', greeting: '🇫🇷 法国国庆日!<br>', range: 1 },
  { date: '10-01', greeting: '🇨🇳 国庆节快乐!<br>', range: 7 },
  { date: '10-03', greeting: '🇩🇪 德国统一日<br>', range: 1 },
  { date: '10-31', greeting: '🇺🇸🇨🇦 万圣节快乐!<br>', range: 2 },
  { date: '12-25', greeting: '🇪🇺 圣诞节快乐!<br>', range: 5 },
  { date: '05-17', greeting: '🏳️‍🌈 IDAHOTB<br>', range: 5 },
  { date: '06-27', greeting: '🇩🇪 欧洲杯！<br>', range: 5 },

];

let fixedYearHolidays = [

  //个人节日
  { date: '2025-04-11', greeting: '🇨🇳 我的生日!<br>', range: 1 },
  { date: '2026-04-30', greeting: '🇨🇳 我的生日!<br>', range: 1 },
  { date: '2027-04-20', greeting: '🇨🇳 我的生日!<br>', range: 1 },
  { date: '2028-04-08', greeting: '🇨🇳 我的生日!<br>', range: 1 },
  { date: '2029-04-27', greeting: '🇨🇳 我的生日!<br>', range: 1 },
  { date: '2030-04-16', greeting: '🇨🇳 我的生日!<br>', range: 1 },

  { date: '2024-08-27', greeting: '🇪🇺 留欧十年纪念日!<br>', range: 1 },

  { date: '2024-08-24', greeting: '🇨🇳 回国度假中!<br>', range: 23 },

  //德国瑞士节日
  { date: '2024-09-21', greeting: '🇩🇪 慕尼黑啤酒节!<br>', range: 16 },

  { date: '2024-05-30', greeting: '🇪🇺 圣体节<br>', range: 4 },

  { date: '2024-03-31', greeting: '🇪🇺 复活节假期<br>', range: 4 },
  { date: '2025-04-18', greeting: '🇪🇺 复活节假期<br>', range: 4 },
  { date: '2026-04-03', greeting: '🇪🇺 复活节假期<br>', range: 4 },
  { date: '2027-03-26', greeting: '🇪🇺 复活节假期<br>', range: 4 },

  // 中国农历新年
  { date: '2024-02-10', greeting: '🇨🇳 新年快乐, 龙行天下!<br>', range: 7 },
  { date: '2025-01-29', greeting: '🇨🇳 新年快乐, 银蛇劲舞!<br>', range: 7 },
  { date: '2026-02-17', greeting: '🇨🇳 新年快乐, 马到成功!<br>', range: 7 },
  { date: '2027-02-06', greeting: '🇨🇳 新年快乐, 三羊开泰!<br>', range: 7 },
  { date: '2028-01-26', greeting: '🇨🇳 新年快乐, 金猴送福!<br>', range: 7 },
  { date: '2029-02-13', greeting: '🇨🇳 新年快乐, 雄鸡晓唱!<br>', range: 7 },
  { date: '2030-02-03', greeting: '🇨🇳 新年快乐, 狗年旺旺!<br>', range: 7 },

  // 中国农历清明节
  { date: '2024-04-04', greeting: '🇨🇳 清明雨上, 杏花江南 <br>', range: 3 },
  { date: '2025-04-04', greeting: '🇨🇳 清明雨上, 杏花江南 <br>', range: 3 },
  { date: '2026-04-05', greeting: '🇨🇳 清明雨上, 杏花江南 <br>', range: 3 },
  { date: '2027-04-05', greeting: '🇨🇳 清明雨上, 杏花江南 <br>', range: 3 },

  { date: '2024-06-10', greeting: '🇨🇳 龙舟载梦, 端午安康!<br>', range: 3 },
  { date: '2025-05-31', greeting: '🇨🇳 龙舟载梦, 端午安康!<br>', range: 3 },
  { date: '2026-06-19', greeting: '🇨🇳 龙舟载梦, 端午安康!<br>', range: 3 },
  { date: '2027-06-09', greeting: '🇨🇳 龙舟载梦, 端午安康!<br>', range: 3 },

  { date: '2024-09-15', greeting: '🇨🇳 中秋月明, 相思遥寄!<br>', range: 3 },
  { date: '2025-10-06', greeting: '🇨🇳 中秋月明, 相思遥寄!<br>', range: 3 },
  { date: '2026-09-25', greeting: '🇨🇳 中秋月明, 相思遥寄!<br>', range: 3 },
  { date: '2027-09-15', greeting: '🇨🇳 中秋月明, 相思遥寄!<br>', range: 3 },

];

function isHolidayNear(today, holiday) {
  const todayDate = new Date(today);
  let holidayDate;

  if (holiday.date.split('-').length === 3) { // Fixed-year date
    holidayDate = new Date(holiday.date);
  } else { // Recurring date
    holidayDate = new Date(todayDate.getFullYear(), parseInt(holiday.date.split('-')[0]) - 1, parseInt(holiday.date.split('-')[1]));
  }

  // Check if holiday date matches today's date
  if (
    todayDate.getFullYear() === holidayDate.getFullYear() &&
    todayDate.getMonth() === holidayDate.getMonth() &&
    todayDate.getDate() === holidayDate.getDate()
  ) {
    const startRange = new Date(todayDate.getTime() - holiday.range * 24 * 60 * 60 * 1000);
    const endRange = new Date(todayDate.getTime() + holiday.range * 24 * 60 * 60 * 1000);

    return todayDate >= startRange && todayDate <= endRange;
  }

  return false;
}

function checkHoliday() {
  const today = new Date();
  let foundHoliday = false;
  let greetingMessage = '';

  recurringHolidays.forEach(holiday => {
    if (isHolidayNear(today, holiday)) {
      foundHoliday = true;
      greetingMessage += holiday.greeting;
      return;
    }
  });

  fixedYearHolidays.forEach(holiday => {
    if (isHolidayNear(today, holiday)) {
      foundHoliday = true;
      greetingMessage += holiday.greeting;
      return;
    }
  });

  if (foundHoliday) {
    document.getElementById('greetings').innerHTML = greetingMessage;
  }
}

window.onload = checkHoliday;
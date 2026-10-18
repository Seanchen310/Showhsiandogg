// 結晶提醒：把提醒時間轉成行事曆檔回傳。
// iPhone Safari 打開 text/calendar 會直接跳出「加入行事曆」畫面，不會變成下載檔案。
// 參數 e＝「時間戳(毫秒)~標題」以 | 分隔，最多 10 筆；不存任何資料。
const clean = s => String(s).replace(/[\r\n\;,]/g, ' ').slice(0, 60);
const utc = ms => new Date(ms).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
const DESC = '修仙小幫狗 結晶提醒 https://showhsiandogg.netlify.app/crystal.html';

export default async req => {
  const now = Date.now();
  const evs = (new URL(req.url).searchParams.get('e') || '').split('|').slice(0, 10)
    .map(x => { const i = x.indexOf('~'); return { t: +x.slice(0, i), title: clean(x.slice(i + 1)) }; })
    .filter(e => Number.isFinite(e.t) && e.t > now - 864e5 && e.t < now + 30 * 864e5 && e.title);
  if (!evs.length) return new Response('沒有提醒時間', { status: 400 });
  const L = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//showhsiandogg//crystal//ZH', 'METHOD:PUBLISH'];
  evs.forEach((e, k) => L.push('BEGIN:VEVENT', `UID:${e.t}-${k}@showhsiandogg`, `DTSTAMP:${utc(now)}`,
    `DTSTART:${utc(e.t)}`, `DTEND:${utc(e.t + 5 * 60000)}`, `SUMMARY:${e.title}`, `DESCRIPTION:${DESC}`,
    'BEGIN:VALARM', 'ACTION:DISPLAY', `DESCRIPTION:${e.title}`, 'TRIGGER:PT0M', 'END:VALARM', 'END:VEVENT'));
  L.push('END:VCALENDAR');
  return new Response(L.join('\r\n') + '\r\n', {
    headers: {
      'content-type': 'text/calendar; charset=utf-8',
      'content-disposition': 'inline; filename="crystal.ics"',
      'cache-control': 'no-store',
    },
  });
};

const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const nodemailer = require('nodemailer');

// GitHub Actions에서 전달받은 JSON 환경변수 파싱
const serviceAccount = JSON.parse(process.env.FIREBASE_CREDENTIALS);

initializeApp({
  credential: cert(serviceAccount),
});

const db = getFirestore();

// Gmail 설정
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'oys110801@gmail.com',
    pass: 'ltckfiwshzxznwsa', // 앱 비밀번호
  },
});

// 오늘 날짜 (한국시간 기준)
const now = new Date();
now.setHours(now.getHours() + 9); // UTC → KST
now.setHours(0, 0, 0, 0);

const d1 = new Date(now);
d1.setDate(now.getDate() + 1);

const d10 = new Date(now);
d10.setDate(now.getDate() + 10);

async function sendReminders() {
  const snapshot = await db.collection('schedules').get();
  console.log(`📥 읽은 일정 개수: ${snapshot.size}`);

  const docs = snapshot.docs;

  for (const doc of docs) {
    const data = doc.data();
    const surgeryDate = new Date(data.date);
    surgeryDate.setHours(0, 0, 0, 0);

    console.log(`[데이터 확인] ${data.patient} / ${data.date} → 수술일자: ${surgeryDate.toDateString()}`);

    let dDayLabel = '';
    if (surgeryDate.getTime() === d10.getTime()) {
      dDayLabel = 'D-10일';
    } else if (surgeryDate.getTime() === d1.getTime()) {
      dDayLabel = 'D-1일';
    } else {
      console.log(`⏭️ ${data.date}는 D-1 또는 D-10이 아님`);
      continue;
    }

    const subject = `[수술 ${dDayLabel} 알림] ${data.patient} (${data.date})`;

    const text = `수술 ${dDayLabel} 입니다. 일정 확인해주세요.\n
병원 : ${data.hospital}
수술일 : ${data.date}
환자명 : ${data.patient}`;

    const recipients = Array.isArray(data.email) ? data.email : [data.email];

    for (const recipient of recipients) {
      if (!recipient) {
        console.warn(`⚠️ 이메일 주소 없음 (patient: ${data.patient})`);
        continue;
      }
      try {
        await transporter.sendMail({
          from: '수술일정 알림 <oys110801@gmail.com>',
          to: recipient,
          subject,
          text,
        });
        console.log(`✅ 이메일 전송 완료: ${recipient}`);
      } catch (err) {
        console.error(`❌ 이메일 전송 실패 (${recipient}):`, err);
      }
    }
  }
}

sendReminders().catch((err) => {
  console.error('❌ 전체 에러:', err);
});

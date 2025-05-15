const functions = require("firebase-functions");
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");

admin.initializeApp();
const db = admin.firestore();

// 1. Gmail 발신자 정보 입력
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "your.email@gmail.com",      // Gmail 주소
    pass: "your-app-password",         // 앱 비밀번호 (보통 16자리)
  },
});

// 2. 매일 자정에 실행
exports.sendSurgeryReminders = functions.pubsub
  .schedule("0 0 * * *") // 매일 00:00 실행
  .timeZone("Asia/Seoul")
  .onRun(async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const targetDates = [1, 10].map((d) => {
      const target = new Date(today);
      target.setDate(today.getDate() + d);
      return target.toISOString().split("T")[0]; // yyyy-mm-dd 형식
    });

    const snapshot = await db.collection("schedules").get();

    for (const doc of snapshot.docs) {
      const data = doc.data();
      const scheduleDate = data.date;

      if (!targetDates.includes(scheduleDate)) continue;

      const daysBefore = (new Date(scheduleDate) - today) / (1000 * 60 * 60 * 24); // 1 또는 10
      const emailList = Array.isArray(data.email) ? data.email : [data.email];

      for (const toEmail of emailList) {
        const subject = `[수술 알림] D-${daysBefore}: ${data.patient} 환자 수술 예정`;
        const text = `
🔔 수술 일정 알림

병원명: ${data.hospital || "병원 미입력"}
수술 날짜: ${data.date}
환자 이름: ${data.patient}

위 환자의 수술이 예정되어 있습니다.
확인 부탁드립니다.
        `.trim();

        await transporter.sendMail({
          from: "your.email@gmail.com",
          to: toEmail,
          subject,
          text,
        });

        console.log(`📧 ${toEmail}에게 메일 발송 완료 (D-${daysBefore})`);
      }
    }

    return null;
  });

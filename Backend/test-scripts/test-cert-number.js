require('dotenv').config({ path: './config.env' });
const mongoose = require('mongoose');
const Certificate = require('./models/Certificate');

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  console.log('✅ Connected');

  // Check existing certificates
  const existing = await Certificate.find({}).sort({ certificateNumber: -1 }).limit(5);
  console.log('\n📋 Existing certificates:');
  existing.forEach(c => console.log(`  ${c.certificateNumber} - Student: ${c.studentName}`));

  // Get the latest certificate number
  const latest = existing[0];
  console.log(`\n🔢 Latest certificate: ${latest ? latest.certificateNumber : 'None'}`);

  // Test certificate number generation
  console.log('\n🧪 Testing certificate number generation...');
  const testCert = new Certificate({
    student: latest.student,
    course: latest.course,
    studentName: 'Test Student',
    courseName: 'Test Course',
    completionDate: new Date(),
    issuedBy: latest.issuedBy,
    status: 'pending'
  });

  // This will trigger the pre-save hook
  try {
    await testCert.save();
    console.log(`✅ New certificate created: ${testCert.certificateNumber}`);

    // Clean up
    await Certificate.findByIdAndDelete(testCert._id);
    console.log('🧹 Test certificate deleted');
  } catch (err) {
    console.error('❌ Error:', err.message);
  }

  await mongoose.connection.close();
  console.log('✅ Done');
}).catch(err => console.error('Connection error:', err.message));


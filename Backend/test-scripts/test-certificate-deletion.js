require('dotenv').config({ path: './config.env' });
const mongoose = require('mongoose');
const Certificate = require('./models/Certificate');
const User = require('./models/User');
const Course = require('./models/Course');

async function testCertificateDeletionAndRecreation() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Find a student and course for testing
    const student = await User.findOne({ role: 'student' });
    const course = await Course.findOne({});

    if (!student || !course) {
      console.log('❌ Need at least one student and one course in database');
      await mongoose.connection.close();
      return;
    }

    console.log(`📋 Test Setup:`);
    console.log(`  Student: ${student.name} (${student._id})`);
    console.log(`  Course: ${course.title} (${course._id})\n`);

    // Step 1: Check for existing certificate
    console.log('🔍 Step 1: Checking for existing certificate...');
    let existingCert = await Certificate.findOne({
      student: student._id,
      course: course._id
    });

    if (existingCert) {
      console.log(`  Found existing certificate: ${existingCert.certificateNumber}`);
      console.log(`  ID: ${existingCert._id}\n`);
    } else {
      console.log(`  No existing certificate found\n`);

      // Create a test certificate
      console.log('📝 Creating a test certificate...');
      const testCert = new Certificate({
        student: student._id,
        course: course._id,
        studentName: student.name,
        courseName: course.title,
        completionDate: new Date(),
        issuedBy: student._id, // Using student as issuer for test
        status: 'issued',
        certificateUrl: '/uploads/test-cert.pdf'
      });

      await testCert.save();
      console.log(`  Created test certificate: ${testCert.certificateNumber}`);
      console.log(`  ID: ${testCert._id}\n`);
      existingCert = testCert;
    }

    // Step 2: Try to create duplicate (should fail)
    console.log('🔍 Step 2: Attempting to create duplicate certificate (should fail)...');
    const duplicateCheck = await Certificate.findOne({
      student: student._id,
      course: course._id
    });

    if (duplicateCheck) {
      console.log(`  ✅ Duplicate check working: Found existing certificate`);
      console.log(`  Certificate: ${duplicateCheck.certificateNumber}\n`);
    } else {
      console.log(`  ❌ Warning: No certificate found - duplicate check would fail!\n`);
    }

    // Step 3: Delete the certificate
    console.log('🗑️  Step 3: Deleting the certificate...');
    const certToDelete = await Certificate.findById(existingCert._id);

    if (!certToDelete) {
      console.log(`  ❌ Certificate not found for deletion\n`);
    } else {
      console.log(`  Found certificate to delete: ${certToDelete.certificateNumber}`);

      const deleted = await Certificate.findByIdAndDelete(existingCert._id);
      console.log(`  Deleted certificate: ${deleted.certificateNumber}`);

      // Verify deletion
      const checkAfterDelete = await Certificate.findById(existingCert._id);
      if (checkAfterDelete) {
        console.log(`  ❌ ERROR: Certificate still exists after deletion!`);
        console.log(`  This is the bug - certificate not properly deleted\n`);
      } else {
        console.log(`  ✅ Deletion verified - certificate no longer exists\n`);
      }
    }

    // Step 4: Check if we can create a new certificate now
    console.log('🔍 Step 4: Checking if new certificate can be created...');
    const checkBeforeRecreate = await Certificate.findOne({
      student: student._id,
      course: course._id
    });

    if (checkBeforeRecreate) {
      console.log(`  ❌ ERROR: Certificate still found after deletion!`);
      console.log(`  Certificate: ${checkBeforeRecreate.certificateNumber}`);
      console.log(`  ID: ${checkBeforeRecreate._id}`);
      console.log(`  This is why recreation fails - old certificate not deleted properly\n`);
    } else {
      console.log(`  ✅ No certificate found - can create new one\n`);

      // Step 5: Create new certificate
      console.log('📝 Step 5: Creating new certificate...');
      const newCert = new Certificate({
        student: student._id,
        course: course._id,
        studentName: student.name,
        courseName: course.title,
        completionDate: new Date(),
        issuedBy: student._id,
        status: 'issued',
        certificateUrl: '/uploads/new-cert.pdf'
      });

      await newCert.save();
      console.log(`  ✅ New certificate created successfully!`);
      console.log(`  Certificate Number: ${newCert.certificateNumber}`);
      console.log(`  ID: ${newCert._id}\n`);

      // Clean up - delete the test certificate
      await Certificate.findByIdAndDelete(newCert._id);
      console.log(`  🧹 Cleaned up test certificate\n`);
    }

    console.log('✅ Test completed!');
    console.log('\n📊 Summary:');
    console.log('  If deletion worked: You should be able to create new certificate');
    console.log('  If deletion failed: Old certificate blocks new creation');

    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');

  } catch (error) {
    console.error('❌ Test error:', error);
    if (error.code === 11000) {
      console.error('\n⚠️  DUPLICATE KEY ERROR detected!');
      console.error('   This means there might be a unique index on student+course');
      console.error('   Check database indexes with: db.certificates.getIndexes()');
    }
    process.exit(1);
  }
}

testCertificateDeletionAndRecreation();


require('dotenv').config();
const mongoose = require('mongoose');
const Report = require('../models/Report');

// MongoDB Connection
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {});
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

// Fix report IDs for existing reports
const fixReportIds = async () => {
  try {
    // Connect to DB
    await connectDB();
    
    // Find all reports without a reportId
    const reports = await Report.find({ 
      $or: [
        { reportId: { $exists: false } },
        { reportId: null },
        { reportId: '' }
      ] 
    });
    
    console.log(`Found ${reports.length} reports without a reportId`);
    
    if (reports.length === 0) {
      console.log('No reports need fixing');
      process.exit(0);
    }
    
    // Generate and save reportIds for each report
    for (let i = 0; i < reports.length; i++) {
      const report = reports[i];
      const date = report.reportDate || new Date();
      
      // Format same as in model's pre-save hook
      const year = date.getFullYear().toString().substr(-2);
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      
      // Find reports created on the same day to determine sequence number
      const sameDayReports = await Report.countDocuments({
        reportId: { $regex: `REP-${year}${month}${day}` },
        _id: { $ne: report._id }
      });
      
      // Format: REP-YYMMDD-XXX where XXX is a sequential number
      report.reportId = `REP-${year}${month}${day}-${(sameDayReports + 1).toString().padStart(3, '0')}`;
      
      await report.save();
      console.log(`Fixed report ${i+1}/${reports.length}: ID ${report._id} -> ${report.reportId}`);
    }
    
    console.log('All report IDs have been fixed');
    process.exit(0);
  } catch (error) {
    console.error('Error fixing report IDs:', error);
    process.exit(1);
  }
};

// Run the fix
fixReportIds(); 
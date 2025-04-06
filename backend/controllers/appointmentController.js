const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const { validationResult } = require('express-validator');

// @desc    Create a new appointment
// @route   POST /api/appointments
// @access  Private
exports.createAppointment = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    // Check if the doctor is available at the requested time
    const { doctor, appointmentDate, startTime, endTime } = req.body;
    
    const isAvailable = await checkDoctorAvailability(
      doctor.doctorId,
      new Date(appointmentDate),
      startTime,
      endTime
    );
    
    if (!isAvailable) {
      return res.status(400).json({ 
        message: 'Doctor is not available at the requested time. Please select a different time slot.' 
      });
    }

    // Add the user who created this appointment
    const appointmentData = {
      ...req.body,
      createdBy: req.user.id
    };

    // Create appointment
    const appointment = await Appointment.create(appointmentData);
    
    res.status(201).json(appointment);
  } catch (error) {
    console.error('Error creating appointment:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all appointments
// @route   GET /api/appointments
// @access  Private
exports.getAppointments = async (req, res) => {
  try {
    // Allow filtering by date range, doctor, department, or status
    const { startDate, endDate, doctorId, department, status } = req.query;
    
    const query = {};
    
    if (startDate && endDate) {
      query.appointmentDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    } else if (startDate) {
      query.appointmentDate = { $gte: new Date(startDate) };
    } else if (endDate) {
      query.appointmentDate = { $lte: new Date(endDate) };
    }
    
    if (doctorId) {
      query['doctor.doctorId'] = doctorId;
    }
    
    if (department) {
      query.department = department;
    }
    
    if (status) {
      query.status = status;
    }
    
    const appointments = await Appointment.find(query)
      .sort({ appointmentDate: 1, startTime: 1 });
    
    res.json(appointments);
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get appointment by ID
// @route   GET /api/appointments/:id
// @access  Private
exports.getAppointmentById = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    
    res.json(appointment);
  } catch (error) {
    console.error('Error fetching appointment:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update appointment
// @route   PUT /api/appointments/:id
// @access  Private
exports.updateAppointment = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { doctor, appointmentDate, startTime, endTime, status } = req.body;
    
    // If the appointment time is being updated (not just the status), 
    // check doctor availability
    if (doctor && appointmentDate && startTime && endTime) {
      // Don't check availability against the current appointment being updated
      const currentAppointment = await Appointment.findById(req.params.id);
      
      if (!currentAppointment) {
        return res.status(404).json({ message: 'Appointment not found' });
      }
      
      // Only check availability if doctor, date or time is different from current
      const isDifferentDoctor = doctor.doctorId !== currentAppointment.doctor.doctorId;
      const isDifferentDate = new Date(appointmentDate).toDateString() !== 
                             new Date(currentAppointment.appointmentDate).toDateString();
      const isDifferentTime = startTime !== currentAppointment.startTime || 
                             endTime !== currentAppointment.endTime;
      
      if (isDifferentDoctor || isDifferentDate || isDifferentTime) {
        const isAvailable = await checkDoctorAvailability(
          doctor.doctorId,
          new Date(appointmentDate),
          startTime,
          endTime,
          req.params.id // Exclude current appointment from availability check
        );
        
        if (!isAvailable) {
          return res.status(400).json({ 
            message: 'Doctor is not available at the requested time. Please select a different time slot.' 
          });
        }
      }
    }
    
    const updatedAppointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    
    if (!updatedAppointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    
    res.json(updatedAppointment);
  } catch (error) {
    console.error('Error updating appointment:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete appointment
// @route   DELETE /api/appointments/:id
// @access  Private
exports.deleteAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    
    await appointment.remove();
    
    res.json({ message: 'Appointment removed' });
  } catch (error) {
    console.error('Error deleting appointment:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get available time slots for a doctor on a given day
// @route   GET /api/appointments/available-slots
// @access  Private
exports.getAvailableTimeSlots = async (req, res) => {
  try {
    const { doctorId, date } = req.query;
    
    if (!doctorId || !date) {
      return res.status(400).json({ message: 'Doctor ID and date are required' });
    }
    
    // Get doctor's working hours and available days
    const doctor = await Doctor.findOne({ doctorId });
    
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }
    
    const appointmentDate = new Date(date);
    const dayOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][appointmentDate.getDay()];
    
    // Check if doctor works on this day
    if (!doctor.availableDays.includes(dayOfWeek)) {
      return res.json({ 
        available: false,
        message: `Dr. ${doctor.firstName} ${doctor.lastName} does not have appointments on ${dayOfWeek}s.`,
        availableSlots: []
      });
    }
    
    // Get doctor's working hours
    const startHour = doctor.availableTimeSlots.start; // "09:00"
    const endHour = doctor.availableTimeSlots.end;     // "17:00"
    
    // Generate all possible time slots in 30-minute increments
    const slots = generateTimeSlots(startHour, endHour, 30);
    
    // Find existing appointments for this doctor on this day
    const existingAppointments = await Appointment.find({
      'doctor.doctorId': doctorId,
      appointmentDate: {
        $gte: new Date(appointmentDate.setHours(0, 0, 0, 0)),
        $lt: new Date(appointmentDate.setHours(23, 59, 59, 999))
      },
      status: { $ne: 'Cancelled' } // Exclude cancelled appointments
    });
    
    // Mark slots that are already booked
    const bookedSlots = existingAppointments.map(appt => appt.startTime);
    
    // Filter out the booked slots
    const availableSlots = slots.filter(slot => !bookedSlots.includes(slot));
    
    res.json({
      available: availableSlots.length > 0,
      doctorName: `Dr. ${doctor.firstName} ${doctor.lastName}`,
      department: doctor.department,
      workingHours: `${startHour} - ${endHour}`,
      availableSlots
    });
  } catch (error) {
    console.error('Error getting available time slots:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Utility functions

// Check if doctor is available at the requested time
async function checkDoctorAvailability(doctorId, date, startTime, endTime, excludeAppointmentId = null) {
  // Check if doctor exists and works on this day
  const doctor = await Doctor.findOne({ doctorId });
  
  if (!doctor) {
    return false;
  }
  
  const dayOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][date.getDay()];
  
  // Check if doctor works on this day
  if (!doctor.availableDays.includes(dayOfWeek)) {
    return false;
  }
  
  // Check if requested time is within doctor's working hours
  if (startTime < doctor.availableTimeSlots.start || endTime > doctor.availableTimeSlots.end) {
    return false;
  }
  
  // Find overlapping appointments
  const query = {
    'doctor.doctorId': doctorId,
    appointmentDate: {
      $gte: new Date(date.setHours(0, 0, 0, 0)),
      $lt: new Date(date.setHours(23, 59, 59, 999))
    },
    // Appointment overlaps if: startA < endB AND endA > startB
    $or: [
      {
        startTime: { $lt: endTime },
        endTime: { $gt: startTime }
      }
    ],
    status: { $ne: 'Cancelled' } // Exclude cancelled appointments
  };
  
  // Exclude the current appointment being updated
  if (excludeAppointmentId) {
    query._id = { $ne: excludeAppointmentId };
  }
  
  const overlappingAppointments = await Appointment.countDocuments(query);
  
  return overlappingAppointments === 0;
}

// Generate an array of time slots in 30-minute increments
function generateTimeSlots(startTime, endTime, intervalMinutes) {
  const slots = [];
  let [startHours, startMinutes] = startTime.split(':').map(Number);
  const [endHours, endMinutes] = endTime.split(':').map(Number);
  
  // Convert to minutes for easy calculation
  let currentMinutes = startHours * 60 + startMinutes;
  const totalEndMinutes = endHours * 60 + endMinutes;
  
  while (currentMinutes < totalEndMinutes) {
    const hours = Math.floor(currentMinutes / 60);
    const minutes = currentMinutes % 60;
    
    slots.push(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`);
    
    currentMinutes += intervalMinutes;
  }
  
  return slots;
} 
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Form,
  Input,
  Button,
  Select,
  DatePicker,
  Card,
  Divider,
  InputNumber,
  message,
  Space,
  Row,
  Col,
  Tabs,
  Typography,
  Spin,
  Alert
} from 'antd';
import {
  PlusOutlined,
  MinusCircleOutlined,
  ArrowLeftOutlined,
  SaveOutlined,
  ExperimentOutlined,
  MedicineBoxOutlined
} from '@ant-design/icons';
import reportAPI from '../api/reportAPI';
import patientAPI from '../api/patientAPI';
import doctorAPI from '../api/doctorAPI';

const { Option } = Select;
const { TextArea } = Input;
const { Title } = Typography;
const { TabPane } = Tabs;

const CreateReport = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [patientLoading, setPatientLoading] = useState(false);
  const [doctorLoading, setDoctorLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Fetch patients and doctors on component mount
  useEffect(() => {
    fetchPatients();
    fetchDoctors();
  }, []);

  const fetchPatients = async () => {
    try {
      setPatientLoading(true);
      const response = await patientAPI.getPatients();
      setPatients(response.data);
      setPatientLoading(false);
    } catch (error) {
      message.error('Failed to fetch patients');
      console.error('Error fetching patients:', error);
      setPatientLoading(false);
    }
  };

  const fetchDoctors = async () => {
    try {
      setDoctorLoading(true);
      const response = await doctorAPI.getDoctors();
      setDoctors(response.data);
      setDoctorLoading(false);
    } catch (error) {
      message.error('Failed to fetch doctors');
      console.error('Error fetching doctors:', error);
      setDoctorLoading(false);
    }
  };

  const onFinish = async (values) => {
    try {
      setSubmitting(true);
      
      // Find patient and doctor names from their IDs
      const selectedPatient = patients.find(p => p._id === values.patientId);
      const selectedDoctor = doctors.find(d => d._id === values.doctorId);
      
      if (!selectedPatient || !selectedDoctor) {
        message.error('Invalid patient or doctor selection');
        setSubmitting(false);
        return;
      }
      
      // Format report data
      const reportData = {
        ...values,
        patientName: `${selectedPatient.firstName} ${selectedPatient.lastName}`,
        doctorName: `${selectedDoctor.firstName} ${selectedDoctor.lastName}`,
        reportDate: values.reportDate?.toISOString() || new Date().toISOString(),
        followUpDate: values.followUpDate?.toISOString() || null
      };
      
      const response = await reportAPI.createReport(reportData);
      message.success('Medical report created successfully');
      
      // Navigate to the created report's details page
      navigate(`/reports/${response.data._id}`);
    } catch (error) {
      message.error('Failed to create medical report');
      console.error('Error creating report:', error);
      setSubmitting(false);
    }
  };

  const handlePatientChange = (patientId) => {
    const selectedPatient = patients.find(p => p._id === patientId);
    if (selectedPatient) {
      form.setFieldsValue({
        patientId: selectedPatient._id
      });
    }
  };

  const handleDoctorChange = (doctorId) => {
    const selectedDoctor = doctors.find(d => d._id === doctorId);
    if (selectedDoctor) {
      form.setFieldsValue({
        doctorId: selectedDoctor._id
      });
    }
  };

  if (patientLoading || doctorLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="create-report-page">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <Link to="/reports">
            <Button icon={<ArrowLeftOutlined />} className="mr-4">
              Back to Reports
            </Button>
          </Link>
          <Title level={2} className="m-0">Create Medical Report</Title>
        </div>
      </div>

      {patients.length === 0 || doctors.length === 0 ? (
        <Alert
          message="Missing Information"
          description={
            <div>
              {patients.length === 0 && <p>No patients found in the system. Please add patients first.</p>}
              {doctors.length === 0 && <p>No doctors found in the system. Please add doctors first.</p>}
            </div>
          }
          type="warning"
          showIcon
        />
      ) : (
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{
            reportDate: null,
            tests: [],
            medications: [],
            status: 'draft'
          }}
        >
          <Card title="Basic Information" className="mb-6">
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item
                  name="patientId"
                  label="Patient"
                  rules={[{ required: true, message: 'Please select a patient' }]}
                >
                  <Select
                    showSearch
                    placeholder="Select a patient"
                    optionFilterProp="children"
                    onChange={handlePatientChange}
                    filterOption={(input, option) =>
                      option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                    }
                  >
                    {patients.map(patient => (
                      <Option key={patient._id} value={patient._id}>
                        {`${patient.firstName} ${patient.lastName}`}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name="doctorId"
                  label="Doctor"
                  rules={[{ required: true, message: 'Please select a doctor' }]}
                >
                  <Select
                    showSearch
                    placeholder="Select a doctor"
                    optionFilterProp="children"
                    onChange={handleDoctorChange}
                    filterOption={(input, option) =>
                      option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                    }
                  >
                    {doctors.map(doctor => (
                      <Option key={doctor._id} value={doctor._id}>
                        {`${doctor.firstName} ${doctor.lastName}`}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>
            
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item
                  name="reportDate"
                  label="Report Date"
                  rules={[{ required: true, message: 'Please select a date' }]}
                >
                  <DatePicker className="w-full" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name="status"
                  label="Status"
                  rules={[{ required: true, message: 'Please select a status' }]}
                >
                  <Select placeholder="Select report status">
                    <Option value="draft">Draft</Option>
                    <Option value="final">Final</Option>
                    <Option value="amended">Amended</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>
          </Card>
          
          <Tabs defaultActiveKey="findings" className="bg-white rounded shadow mb-6">
            <TabPane tab="Findings & Diagnosis" key="findings">
              <div className="p-4">
                <Form.Item
                  name="symptoms"
                  label="Symptoms"
                  rules={[{ required: true, message: 'Please enter symptoms' }]}
                >
                  <TextArea rows={4} placeholder="Describe the patient's symptoms" />
                </Form.Item>
                
                <Form.Item
                  name="diagnosis"
                  label="Diagnosis"
                  rules={[{ required: true, message: 'Please enter a diagnosis' }]}
                >
                  <TextArea rows={4} placeholder="Enter the diagnosis" />
                </Form.Item>
                
                <Form.Item
                  name="treatment"
                  label="Treatment Plan"
                >
                  <TextArea rows={4} placeholder="Describe the treatment plan" />
                </Form.Item>
                
                <Form.Item
                  name="recommendations"
                  label="Recommendations"
                >
                  <TextArea rows={4} placeholder="Enter any recommendations for the patient" />
                </Form.Item>
              </div>
            </TabPane>
            
            <TabPane tab={<span><MedicineBoxOutlined /> Medications</span>} key="medications">
              <div className="p-4">
                <Form.List name="medications">
                  {(fields, { add, remove }) => (
                    <>
                      {fields.map(({ key, name, ...restField }) => (
                        <div key={key} className="bg-gray-50 p-4 mb-4 rounded">
                          <Row gutter={16}>
                            <Col xs={24} md={12}>
                              <Form.Item
                                {...restField}
                                name={[name, 'name']}
                                label="Medication Name"
                                rules={[{ required: true, message: 'Please enter medication name' }]}
                              >
                                <Select
                                  showSearch
                                  placeholder="Select or enter medication"
                                  optionFilterProp="children"
                                  filterOption={(input, option) =>
                                    option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                  }
                                >
                                  {reportAPI.getCommonMedications().map((med, index) => (
                                    <Option key={index} value={med.name}>
                                      {med.name}
                                    </Option>
                                  ))}
                                </Select>
                              </Form.Item>
                            </Col>
                            <Col xs={24} md={12}>
                              <Form.Item
                                {...restField}
                                name={[name, 'dosage']}
                                label="Dosage"
                                rules={[{ required: true, message: 'Please enter dosage' }]}
                              >
                                <Input placeholder="e.g., 500mg" />
                              </Form.Item>
                            </Col>
                          </Row>
                          
                          <Row gutter={16}>
                            <Col xs={24} md={12}>
                              <Form.Item
                                {...restField}
                                name={[name, 'frequency']}
                                label="Frequency"
                                rules={[{ required: true, message: 'Please enter frequency' }]}
                              >
                                <Select placeholder="Select frequency">
                                  {reportAPI.getCommonFrequencies().map((freq, index) => (
                                    <Option key={index} value={freq}>
                                      {freq}
                                    </Option>
                                  ))}
                                </Select>
                              </Form.Item>
                            </Col>
                            <Col xs={24} md={12}>
                              <Form.Item
                                {...restField}
                                name={[name, 'duration']}
                                label="Duration"
                                rules={[{ required: true, message: 'Please enter duration' }]}
                              >
                                <Input placeholder="e.g., 7 days, 2 weeks" />
                              </Form.Item>
                            </Col>
                          </Row>
                          
                          <Form.Item
                            {...restField}
                            name={[name, 'notes']}
                            label="Notes"
                          >
                            <TextArea rows={2} placeholder="Additional notes about this medication" />
                          </Form.Item>
                          
                          <Button
                            type="danger"
                            onClick={() => remove(name)}
                            icon={<MinusCircleOutlined />}
                          >
                            Remove Medication
                          </Button>
                        </div>
                      ))}
                      
                      <Form.Item>
                        <Button
                          type="dashed"
                          onClick={() => add()}
                          block
                          icon={<PlusOutlined />}
                        >
                          Add Medication
                        </Button>
                      </Form.Item>
                    </>
                  )}
                </Form.List>
              </div>
            </TabPane>
            
            <TabPane tab={<span><ExperimentOutlined /> Tests</span>} key="tests">
              <div className="p-4">
                <Form.List name="tests">
                  {(fields, { add, remove }) => (
                    <>
                      {fields.map(({ key, name, ...restField }) => (
                        <div key={key} className="bg-gray-50 p-4 mb-4 rounded">
                          <Row gutter={16}>
                            <Col xs={24} md={12}>
                              <Form.Item
                                {...restField}
                                name={[name, 'name']}
                                label="Test Name"
                                rules={[{ required: true, message: 'Please enter test name' }]}
                              >
                                <Select
                                  showSearch
                                  placeholder="Select or enter test"
                                  optionFilterProp="children"
                                  filterOption={(input, option) =>
                                    option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                  }
                                >
                                  {reportAPI.getCommonTestTypes().map((test, index) => (
                                    <Option key={index} value={test.name}>
                                      {test.name}
                                    </Option>
                                  ))}
                                </Select>
                              </Form.Item>
                            </Col>
                            <Col xs={24} md={12}>
                              <Form.Item
                                {...restField}
                                name={[name, 'status']}
                                label="Status"
                                initialValue="ordered"
                              >
                                <Select placeholder="Select status">
                                  <Option value="ordered">Ordered</Option>
                                  <Option value="in-progress">In Progress</Option>
                                  <Option value="completed">Completed</Option>
                                </Select>
                              </Form.Item>
                            </Col>
                          </Row>
                          
                          <Row gutter={16}>
                            <Col xs={24} md={12}>
                              <Form.Item
                                {...restField}
                                name={[name, 'date']}
                                label="Test Date"
                              >
                                <DatePicker className="w-full" />
                              </Form.Item>
                            </Col>
                            <Col xs={24} md={12}>
                              <Form.Item
                                {...restField}
                                name={[name, 'result']}
                                label="Result"
                              >
                                <Input placeholder="Test result if available" />
                              </Form.Item>
                            </Col>
                          </Row>
                          
                          <Form.Item
                            {...restField}
                            name={[name, 'notes']}
                            label="Notes"
                          >
                            <TextArea rows={2} placeholder="Additional notes about this test" />
                          </Form.Item>
                          
                          <Button
                            type="danger"
                            onClick={() => remove(name)}
                            icon={<MinusCircleOutlined />}
                          >
                            Remove Test
                          </Button>
                        </div>
                      ))}
                      
                      <Form.Item>
                        <Button
                          type="dashed"
                          onClick={() => add()}
                          block
                          icon={<PlusOutlined />}
                        >
                          Add Test
                        </Button>
                      </Form.Item>
                    </>
                  )}
                </Form.List>
              </div>
            </TabPane>
            
            <TabPane tab="Vital Signs" key="vitals">
              <div className="p-4">
                <Row gutter={16}>
                  <Col xs={24} md={8}>
                    <Form.Item
                      name={['vitalSigns', 'temperature']}
                      label="Temperature (°F)"
                    >
                      <InputNumber min={90} max={110} step={0.1} className="w-full" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={8}>
                    <Form.Item
                      name={['vitalSigns', 'bloodPressure']}
                      label="Blood Pressure"
                    >
                      <Input placeholder="e.g., 120/80 mmHg" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={8}>
                    <Form.Item
                      name={['vitalSigns', 'heartRate']}
                      label="Heart Rate (bpm)"
                    >
                      <InputNumber min={0} max={300} className="w-full" />
                    </Form.Item>
                  </Col>
                </Row>
                
                <Row gutter={16}>
                  <Col xs={24} md={8}>
                    <Form.Item
                      name={['vitalSigns', 'respiratoryRate']}
                      label="Respiratory Rate (breaths/min)"
                    >
                      <InputNumber min={0} max={60} className="w-full" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={8}>
                    <Form.Item
                      name={['vitalSigns', 'oxygenSaturation']}
                      label="Oxygen Saturation (%)"
                    >
                      <InputNumber min={0} max={100} className="w-full" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={8}>
                    <Form.Item
                      name={['vitalSigns', 'height']}
                      label="Height (cm)"
                    >
                      <InputNumber min={0} max={300} className="w-full" />
                    </Form.Item>
                  </Col>
                </Row>
                
                <Row gutter={16}>
                  <Col xs={24} md={8}>
                    <Form.Item
                      name={['vitalSigns', 'weight']}
                      label="Weight (kg)"
                    >
                      <InputNumber min={0} max={500} className="w-full" />
                    </Form.Item>
                  </Col>
                </Row>
              </div>
            </TabPane>
            
            <TabPane tab="Follow-up" key="followup">
              <div className="p-4">
                <Form.Item
                  name="followUpDate"
                  label="Follow-up Date"
                >
                  <DatePicker className="w-full" />
                </Form.Item>
                
                <Form.Item
                  name="notes"
                  label="Additional Notes"
                >
                  <TextArea rows={4} placeholder="Enter any additional notes or follow-up instructions" />
                </Form.Item>
              </div>
            </TabPane>
          </Tabs>
          
          <div className="flex justify-end space-x-2">
            <Button onClick={() => navigate('/reports')}>
              Cancel
            </Button>
            <Button type="primary" htmlType="submit" loading={submitting} icon={<SaveOutlined />}>
              Create Report
            </Button>
          </div>
        </Form>
      )}
    </div>
  );
};

export default CreateReport; 
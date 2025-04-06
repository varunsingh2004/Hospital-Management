import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
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
  Alert,
  Modal
} from 'antd';
import {
  PlusOutlined,
  MinusCircleOutlined,
  ArrowLeftOutlined,
  SaveOutlined,
  ExperimentOutlined,
  MedicineBoxOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import reportAPI from '../api/reportAPI';
import moment from 'moment';

const { Option } = Select;
const { TextArea } = Input;
const { Title } = Typography;
const { TabPane } = Tabs;
const { confirm } = Modal;

const EditReport = () => {
  const { id } = useParams();
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Fetch report data on component mount
  useEffect(() => {
    fetchReport();
  }, [id]);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const response = await reportAPI.getReportById(id);
      setReport(response.data);
      
      // Format dates for form
      const formattedReport = {
        ...response.data,
        reportDate: response.data.reportDate ? moment(response.data.reportDate) : null,
        followUpDate: response.data.followUpDate ? moment(response.data.followUpDate) : null,
        tests: response.data.tests?.map(test => ({
          ...test,
          date: test.date ? moment(test.date) : null
        })) || []
      };
      
      form.setFieldsValue(formattedReport);
      setLoading(false);
    } catch (error) {
      message.error('Failed to fetch report details');
      console.error('Error fetching report:', error);
      setLoading(false);
    }
  };

  const onFinish = async (values) => {
    try {
      setSubmitting(true);
      
      // Format dates for API
      const formattedValues = {
        ...values,
        reportDate: values.reportDate?.toISOString() || report.reportDate,
        followUpDate: values.followUpDate?.toISOString() || null,
        tests: values.tests?.map(test => ({
          ...test,
          date: test.date?.toISOString() || null
        })) || []
      };
      
      await reportAPI.updateReport(id, formattedValues);
      message.success('Medical report updated successfully');
      
      // Navigate back to the report details page
      navigate(`/reports/${id}`);
    } catch (error) {
      message.error('Failed to update medical report');
      console.error('Error updating report:', error);
      setSubmitting(false);
    }
  };

  const showDeleteConfirm = () => {
    confirm({
      title: 'Are you sure you want to delete this report?',
      icon: <ExclamationCircleOutlined />,
      content: 'This action cannot be undone.',
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk: async () => {
        try {
          await reportAPI.deleteReport(id);
          message.success('Report deleted successfully');
          navigate('/reports');
        } catch (error) {
          message.error('Failed to delete report');
          console.error('Error deleting report:', error);
        }
      }
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  if (!report) {
    return (
      <div className="my-6">
        <Alert
          message="Report Not Found"
          description="The requested medical report could not be found."
          type="error"
          showIcon
          action={
            <Button size="small" type="primary" onClick={() => navigate('/reports')}>
              Back to Reports
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="edit-report-page">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <Link to={`/reports/${id}`}>
            <Button icon={<ArrowLeftOutlined />} className="mr-4">
              Back to Report
            </Button>
          </Link>
          <Title level={2} className="m-0">Edit Medical Report</Title>
        </div>
        <Button type="danger" onClick={showDeleteConfirm}>
          Delete Report
        </Button>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{
          tests: [],
          medications: [],
          status: 'draft'
        }}
      >
        <Card title="Basic Information" className="mb-6">
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                name="patientName"
                label="Patient"
              >
                <Input disabled />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="doctorName"
                label="Doctor"
              >
                <Input disabled />
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={16}>
            <Col xs={24} md={8}>
              <Form.Item
                name="reportId"
                label="Report ID"
              >
                <Input disabled />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                name="reportDate"
                label="Report Date"
                rules={[{ required: true, message: 'Please select a date' }]}
              >
                <DatePicker className="w-full" />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
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
          <Button onClick={() => navigate(`/reports/${id}`)}>
            Cancel
          </Button>
          <Button type="primary" htmlType="submit" loading={submitting} icon={<SaveOutlined />}>
            Update Report
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default EditReport; 
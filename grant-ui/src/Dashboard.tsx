// App.js - Complete React Bootstrap Grant Application UI
// Prerequisites: npm install react-bootstrap bootstrap
// Add to index.js: import 'bootstrap/dist/css/bootstrap.min.css';

import React, { useState, useEffect } from 'react';
import {
  Container, Row, Col, Card, ListGroup, Button, Badge,
  Table, Form, Alert, Spinner
} from 'react-bootstrap';

const App = () => {
  // Mock data simulating Grants, Users, and Application Form tables
  const [grants, setGrants] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [applicationForm, setApplicationForm] = useState({
    userId: '',
    grantId: '',
    status: 'pending'
  });

  useEffect(() => {
    // Simulate fetching from Grants, Users, Application Form tables
    setTimeout(() => {
      setGrants([
        { id: 1, title: 'AI Research Grant 2026', amount: '$50,000', 
          deadline: '2026-03-31', status: 'Open', applicants: 23 },
        { id: 2, title: 'DevOps Innovation Fund', amount: '$25,000', 
          deadline: '2026-04-15', status: 'Open', applicants: 12 },
        { id: 3, title: 'Cloud Infrastructure Grant', amount: '$75,000', 
          deadline: '2026-02-28', status: 'Closing Soon', applicants: 45 }
      ]);
      
      setUsers([
        { id: 1, name: 'Willian Belolli', email: 'willian.belolli@example.com', 
          role: 'DevOps Engineer', organization: 'Atlantic Technological University (ATU) '}
      ]);
      
      setLoading(false);
    }, 1000);
  }, []);

  const handleApply = (grantId) => {
    const user = users[0]; // Current logged-in user
    const newApplication = {
      ...applicationForm,
      userId: user.id,
      grantId: grantId,
      appliedAt: new Date().toISOString()
    };
    setApplicationForm(newApplication);
    alert(`Applied for grant ID: ${grantId}`);
  };

  if (loading) {
    return (
      <Container className="mt-5 text-center">
        <Spinner animation="border" variant="primary" />
        <h4>Loading grants and user data...</h4>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      {/* Organization Description */}
      <Row className="mb-5">
        <Col>
          <Card className="border-0 shadow-sm">
            <Card.Body>
              <Card.Title className="h2 text-primary mb-3">
                Nausicaas Global Green Initiative
              </Card.Title>
              <Card.Text className="lead">
                Studio Ghibli’s Climate Change Grant Programs are dedicated to supporting innovative projects that align with
                the UN Sustainable Development Goals and promote environmental sustainability worldwide. Through these 
                initiatives, we aim to empower creative thinkers, researchers, and organizations who are making a measurable 
                impact on the planet’s future.<br/><br/>
                
                Our platform provides transparent and efficient management of multiple grant opportunities, 
                including the renowned Teto Grant, which awards up to €10,000 for projects focused on climate action, 
                biodiversity conservation, and ecological education. By fostering collaboration between art, science, and 
                community engagement, Studio Ghibli continues its mission to inspire positive change for a more sustainable 
                and harmonious world.<br /><br />
              </Card.Text>
              <Badge bg="success" className="fs-6 px-3 py-2">
                150+ Projects Funded Since 2020
              </Badge>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Grant Lists */}
      <Row className="mb-5">
        <Col>
          <h2 className="mb-4">Available Grants</h2>
          <Table responsive hover className="table-striped">
            <thead className="table-dark">
              <tr>
                <th>Grant Title</th>
                <th>Amount</th>
                <th>Deadline</th>
                <th>Status</th>
                <th>Applicants</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {grants.map((grant) => (
                <tr key={grant.id}>
                  <td>
                    <strong>{grant.title}</strong>
                  </td>
                  <td>{grant.amount}</td>
                  <td>{grant.deadline}</td>
                  <td>
                    <Badge bg={grant.status === 'Closing Soon' ? 'warning' : 'success'}>
                      {grant.status}
                    </Badge>
                  </td>
                  <td>
                    <Badge bg="info">{grant.applicants}</Badge>
                  </td>
                  <td>
                    <Button 
                      variant="outline-primary" 
                      size="sm"
                      onClick={() => handleApply(grant.id)}
                    >
                      Apply Now
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Col>
      </Row>

      {/* Application Status & Form */}
      <Row>
        <Col md={8}>
          <Card>
            <Card.Header className="bg-light">
              <h4>Application Status</h4>
            </Card.Header>
            <Card.Body>
              <Alert variant="info">
                <strong>Current User:</strong> {users[0]?.name} ({users[0]?.role})
                <br />
                <strong>Latest Application:</strong> {applicationForm.grantId ? 
                  `Grant ID ${applicationForm.grantId}` : 'None submitted'}
              </Alert>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card>
            <Card.Header className="bg-primary text-white">
              <h5>Quick Apply</h5>
            </Card.Header>
            <Card.Body>
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>User</Form.Label>
                  <Form.Control 
                    value={users[0]?.name || ''} 
                    disabled 
                    plaintext
                  />
                </Form.Group>
                <Button 
                  variant="success" 
                  className="w-100 mb-2"
                  onClick={() => handleApply(grants[0]?.id)}
                >
                  Apply for First Grant
                </Button>
                <Button 
                  variant="outline-secondary" 
                  className="w-100"
                  onClick={() => setApplicationForm({})}
                >
                  Reset
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};
export default App;

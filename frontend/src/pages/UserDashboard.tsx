import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Alert, Spinner } from 'react-bootstrap';
import { api } from '@/services/api';  // Keep this (exists from tests)

// Types
interface Grant {
  name: string;
  deadline: string;
  deadline_passed: boolean;
  time_remaining: string;
}

const UserDashboard = () => {
  const [userEmail, setUserEmail] = useState('user@example.com');  // Mock user
  const [availableGrants, setAvailableGrants] = useState<Grant[]>([]);
  const [myApps, setMyApps] = useState({ count: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const handleLogout = async () => {
    await api.auth.logout();
    window.location.href = '/login';
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Use your REAL API
      const grantResponse = await api.grants.listGrants(1, 10);
      const grants = grantResponse.items.filter(g => !g.deadline_passed);
      setAvailableGrants(grants);
      
      setMyApps({ count: 2 });  // Mock for now
      
    } catch (err) {
      console.error(err);
      setError('Failed to load dashboard');
      // Mock data for demo
      setAvailableGrants([
        { name: 'Studio Ghibli Grant', deadline: '2026-03-01', time_remaining: '30 days', deadline_passed: false }
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Spinner animation="border" className="d-flex justify-content-center mt-5" />;
  if (error) return <Alert variant="danger" className="mt-5">{error}</Alert>;

  return (
    <Container className="py-4">
      <Row className="mb-4">
        <Col>
          <h1>User Dashboard - Welcome, {userEmail}</h1>
          <Alert variant="info">
            <strong>Available:</strong> {availableGrants.length} | 
            <strong>Applied:</strong> {myApps.count}
          </Alert>
          <Button variant="outline-danger" onClick={handleLogout}>
            Logout
          </Button>
        </Col>
      </Row>
      
      <Row>
        {availableGrants.map((grant) => (
          <Col md={6} lg={4} key={grant.name} className="mb-4">
            <Card>
              <Card.Body>
                <Card.Title>{grant.name}</Card.Title>
                <Card.Text>
                  <strong>Deadline:</strong> {grant.deadline}<br/>
                  <strong>Time:</strong> {grant.time_remaining}
                </Card.Text>
                <Button variant="primary" className="w-100">
                  Apply Now
                </Button>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default UserDashboard;

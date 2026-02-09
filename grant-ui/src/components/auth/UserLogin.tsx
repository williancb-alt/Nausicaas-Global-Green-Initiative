import { Container, Row, Col, Card, Form, Button } from 'react-bootstrap';
import { FC, useState } from 'react';

interface UserLoginProps {
  onLoginSuccess: () => void;
}

const UserLogin: FC<UserLoginProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLoginSuccess(); // Go to dashboard
  };

  return (
    <Container className="min-vh-100 d-flex align-items-center justify-content-center">
      <Row>
        <Col md={6}>
          <Card>
            <Card.Body className="p-5">
              <h3 className="text-success mb-4 text-center">Applicant Login</h3>
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-4">
                  <Form.Label>Email</Form.Label>
                  <Form.Control 
                    type="email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="applicant@example.com"
                  />
                </Form.Group>
                <Button type="submit" className="w-100" variant="success">
                  Enter Portal
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default UserLogin;

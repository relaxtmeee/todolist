import Card from 'react-bootstrap/Card';

const Header = () => {

    return (
        <Card>
        <Card.Header>Todolist</Card.Header>
        <Card.Body>
            <Card.Title>Тестовое задание</Card.Title>
            <Card.Text>
            Попробуйте организоваться и поставьте себе задачи на день!
            </Card.Text>
        </Card.Body>
        </Card>
    );

}

export default Header;
import React, { Component } from 'react';
import Session from '../../view_models/Session.js';
import User from '../../models/User.js';

class CreateUserView extends Component {

    constructor(props) {
        super(props);

        this.session = Session;
        this.state = {
            email: "",
            password: "",
            first_name: "",
            last_name: "",
            error_messages: ""
        };
        this.user_manager = new User(this.props.config);
        this.createAccount = this.createAccount.bind(this);
        this.handleInputChange = this.handleInputChange.bind(this);
    }

    handleInputChange(event) {
        const target = event.target;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        const name = target.name;

        this.setState({
            [name]: value
        });
    }

    createAccount(evt) {
        evt.preventDefault();
        this.user_manager.logIn(this.state.email, this.state.password)
            .then((user) => {
                this.props.update_user(user);
            })
            .catch((err) => {
                this.setState({ invalid_login: true });
            });
    }

    render() {
        const user_name = this.state.user_name;
        const password = this.state.password;
        const last_name = this.state.last_name;
        const first_name = this.state.first_name;
        return (
            <article>
                <form className="mt-sm-2 ml-sm-2" onSubmit={this.createAccount}>
                    <span className="mr-sm-2">Login:</span>
                    <div className="form-group">
                        <label htmlFor="FirstNameTextBox">First Name:</label>
                        <input
                            type="text"
                            className="form-control mb-2 mr-sm-2"
                            id="FirstNameTextBox"
                            name="first_name"
                            value={first_name}
                            onChange={this.handleInputChange}
                            placeholder=""
                        />
                        <label  htmlFor="LastNameTextBox">Last Name:</label>
                        <input
                            type="text"
                            className="form-control mb-2 mr-sm-2"
                            id="LastNameTextBox"
                            name="last_name"
                            value={last_name}
                            onChange={this.handleInputChange}
                            placeholder=""
                        />
                        <label  htmlFor="UserNameTextBox">
                            Email:
                  </label>
                        <input
                            type="text"
                            className="form-control mb-2 mr-sm-2"
                            id="UserNameTextBox"
                            name="email"
                            value={user_name}
                            onChange={this.handleInputChange}
                            placeholder=""
                        />
                        <label htmlFor="PasswordTextBox">Password:</label>
                        <input
                            type="password"
                            className="form-control mb-2 mr-sm-2"
                            id="PasswordTextBox"
                            name="password"
                            value={password}
                            onChange={this.handleInputChange}
                            placeholder=""
                        />

                    </div>
                    <button id="SubmitButton" className="btn btn-outline-primary mb-2 mr-sm-2" type="submit">Log In</button>
                </form>
            </article>
        );
    }
}

export { CreateUserView };
export default CreateUserView;
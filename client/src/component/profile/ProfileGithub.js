import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import ProfileItem from '../profiles/ProfileItem';
class ProfileGithub extends Component {
  constructor(props) {
    super(props);
    this.state = {
      clientId: '6fc6d599ef56867175d5',
      clientSecret: '30fc626070a391a02258da982d8214d8ee1ae729',
      count: 5,
      sort: 'created: asc',
      repos: [] //it will fill once it will hit api
    };
  }
  componentDidMount() {
    const { username } = this.props;
    const { count, sort, clientId, clientSecret } = this.state;

    fetch(
      `https://api.github.com/users/${username}/repos?per_page=${count}&sort=${sort}&client_id=${clientId}&client_secret=${clientSecret}`
    )
      .then(res => res.json())
      .then(data => {
        if (this.refs.myRef) {
          this.setState({ repos: data });
        }
      })
      .catch(err => console.log(err));
  }
  render() {
    const { repos } = this.state;
    const repoItem = repos.map(repo => (
      <div key={repo.id} class="card card-body mb-2">
        <div className="row">
          <div className="col-md-6">
            <h4>
              <Link to={repo.html_url} className="text-info" target="_blank">
                {repo.name}
              </Link>
            </h4>
            <p>{repo.description}</p>
          </div>
          <div className="col-md-6">
            <span className="badge badge-info mr-1">
              Stars: {repo.stargazers_count}
            </span>{' '}
            <span class="badge badge-secondary mr-1">
              Watchers: {repo.watchers_count}
            </span>
            <span class="badge badge-success">Forks: {repo.forks_count}</span>
          </div>
        </div>
      </div>
    ));
    return (
      <div ref="myRef">
        <hr />
        <h3 className="mb-4">Latest Github Repositories</h3>
        {repoItem}
      </div>
    );
  }
}

ProfileItem.propTypes = {
  username: PropTypes.string.isRequired
};
export default ProfileGithub;

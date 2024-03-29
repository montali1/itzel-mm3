import React from 'react';
import axios from 'axios';
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom';
import './App.css';
import Register from './components/Register/Register';
import Login from './components/Login/Login';
import PostList from './components/PostList/PostList';
import Post from './components/Post/Post';
import CreatePost from './components/Post/CreatePost';
import EditPost from './components/Post/EditPost';

class App extends React.Component {
  state = {
    posts: [],
    post: null,
    token: null,
    user: null
  };

  componentDidMount() {
    axios.get('http://localhost:5000')
    .then((response) => {
      this.setState({
        data: response.data
      })
    })
    .catch((error) => {
      console.error(`Error fetching data: ${error}`);
    })

    this.authenticateUser();
  }

  authenticateUser = () => {
    const token = localStorage.getItem('token');

    if (!token) {
      localStorage.removeItem('user');
      this.setState({ user: null });
    }

    if (token) {
      const config = {
        headers: {
          'x-auth-token': token
        }
      };
      axios.get('http://localhost:5000/api/auth', config)
        .then(response => {
          localStorage.setItem('user', response.data.name);
          this.setState(
            {
              user: response.data.name,
              token: token
            },
            () => {
              this.loadData();
            }
          );
        })
        .catch(error => {
          localStorage.removeItem('user');
          this.setState({ user: null });
          console.error(`Error logging in: ${error}`);
        });
    }
  };

  loadData = () => {
    const { token } = this.state;

    if (token) {
      const config = {
        headers: {
          'x-auth-token': token
        }
      };
      axios
        .get('/api/posts', config)
        .then(response => {
          this.setState({
            posts: response.data
          });
        })
        .catch(error => {
          console.error(`Error fetching data: ${error}`);
        });
    }
  };

  logOut = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.setState({ user: null, token: null });
  };

  viewPost = post => {
    console.log(`view ${post.title}`);
    this.setState({
      post: post
    });
  };

  deletePost = post => {
    const { token } = this.state;

    if (token) {
      const config = {
        headers: {
          'x-auth-token': token
        }
      };

      axios
        .delete(`/api/posts/${post._id}`, config)
        .then(response => {
          const newPosts = this.state.posts.filter(p => p._id !== post._id);
          this.setState({
            posts: [...newPosts]
          });
        })
        .catch(error => {
          console.error(`Error deleting post: ${error}`);
        });
    }
  };

  editPost = post => {
    this.setState({
      post: post
    });
  };

  onPostCreated = post => {
    const newPosts = [...this.state.posts, post];

    this.setState({
      posts: newPosts
    });
  };

  onPostUpdated = post => {
    console.log('updated post: ', post);
    const newPosts = [...this.state.posts];
    const index = newPosts.findIndex(p => p._id === post._id);

    newPosts[index] = post;

    this.setState({
      posts: newPosts
    });
  };

  render() {
    let { user, posts, post, token } = this.state;
    const authProps = {
      authenticateUser: this.authenticateUser
    };

    return (
      <Router>
        <div className="App">
          <header className="App-header">
            <h1>GoodThings</h1>
            <ul>
              <li>
                <Link to="/">Home</Link>
              </li>
              <li>
                  <Link to="/new-post">Register</Link>
              </li>
              <li>
                {user ? (
                  <Link to="" onClick={this.logOut}>
                    Log out
                  </Link>
                ) : (
                  <Link to="/login">Log in</Link>
                )}
              </li>
            </ul>
          </header>
          <main>
              <Switch>
                <Route exact path="/">
                  {user ? (
                    <React.Fragment>
                      <div>Hello {user}!</div>
                      <PostList 
                      posts={posts} 
                      clickPost={this.viewPost}
                      deletePost={this.deletePost}
                      editPost={this.editPost}
                      />
                    </React.Fragment>
                  ) : (
                    <React.Fragment>Please register or login</React.Fragment>
                  )}
                </Route>
              <Route path="/posts/:postId">
                <Post post={post} />
              </Route>
              <Route path="/new-post">
                <CreatePost token={token} onPostCreated={this.onPostCreated} />
              </Route>
              <Route path="/edit-post/:postId">
                <EditPost
                token={token}
                post={post}
                onPostUpdated={this.onPostUpdated}
                />
              </Route>
              <Route
                exact
                path="/register"
                render={() => <Register {...authProps} />}
              />
              <Route
                exact
                path="/login"
                render={() => <Login {...authProps} />}
              />
            </Switch>
          </main>
        </div>
      </Router>
    );
  }
}

export default App;

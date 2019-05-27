import React, { Component, Fragment } from 'react';
import Button from '@material-ui/core/Button';
import Input from '@material-ui/core/Input';
import CircularProgress from '@material-ui/core/CircularProgress';
import Snackbar from '@material-ui/core/Snackbar';
import Tooltip from '@material-ui/core/Tooltip';
import IconButton from '@material-ui/core/IconButton';
import Icon from 'react-eva-icons';
import { saveAs } from 'file-saver';

class EditGeometry extends Component {
  constructor(props) {
    super(props);
    this.state = {
      fetching: false,
      showStopsUpload: false,
    };
    this.onDownloadStopsClick = this.onDownloadStopsClick.bind(this);
    this.onDownloadLoopsClick = this.onDownloadLoopsClick.bind(this);
    this.onUploadStopsClick = this.onUploadStopsClick.bind(this);
    this.onUploadStopsSubmit = this.onUploadStopsSubmit.bind(this);
    this.onUploadStopsCancel = this.onUploadStopsCancel.bind(this);
    this.onUploadLoopsClick = this.onUploadLoopsClick.bind(this);
    this.onUploadLoopsSubmit = this.onUploadLoopsSubmit.bind(this);
    this.onUploadLoopsCancel = this.onUploadLoopsCancel.bind(this);
    this.stopsUploadInput = React.createRef();
    this.loopsUploadInput = React.createRef();
  }

  onDownloadStopsClick(event) {
    this.setState({ fetching: true });
    fetch('/api/download/stops/geojson').then(response => response.blob()).then((blob) => {
      this.setState({ fetching: false });
      saveAs(blob, `stops-${(new Date()).toISOString().substr(0, 10)}.geojson`);
    });
  }

  onDownloadLoopsClick(event) {
    this.setState({ fetching: true });
    fetch('/api/download/loops/geojson').then(response => response.blob()).then((blob) => {
      this.setState({ fetching: false });
      saveAs(blob, `loops-${(new Date()).toISOString().substr(0, 10)}-.geojson`);
    });
  }

  onUploadStopsClick(event) {
    this.setState({ showStopsUpload: true });
  }

  onUploadStopsSubmit(event) {
    event.preventDefault();
    const formData = new FormData();

    formData.append('stops-geojson', this.stopsUploadInput.current.files[0]);

    const options = {
      method: 'POST',
      body: formData,
    };

    fetch('/api/upload/stops/geojson', options);
    this.setState({ showStopsUpload: false });
  }

  onUploadStopsCancel(event) {
    this.setState({ showStopsUpload: false });
  }

  onUploadLoopsClick(event) {
    this.setState({ showLoopsUpload: true });
  }

  onUploadLoopsSubmit(event) {
    event.preventDefault();
    const formData = new FormData();

    formData.append('loops-geojson', this.loopsUploadInput.current.files[0]);

    const options = {
      method: 'POST',
      body: formData,
    };

    fetch('/api/upload/loops/geojson', options);
    this.setState({ showLoopsUpload: false });
  }

  onUploadLoopsCancel(event) {
    this.setState({ showLoopsUpload: false });
  }

  render() {
    return (
      <Fragment>
        <h1 className="Task__heading">Edit Geometry</h1>
        <Button variant="contained" onClick={this.onDownloadStopsClick}>
          <Icon
            name="download"
            fill="#000"
            size="large"
          />
          <span style={{ marginLeft: '0.5rem' }}>Download Stops GeoJSON</span>
        </Button>
        <Button variant="contained" onClick={this.onDownloadLoopsClick}>
          <Icon
            name="download"
            fill="#000"
            size="large"
          />
          <span style={{ marginLeft: '0.5rem' }}>Download Loops GeoJSON</span>
        </Button>
        {
          this.state.showStopsUpload ? (
            <form onSubmit={this.onUploadStopsSubmit}>
              <span style={{ display: 'flex', flexDirection: 'row' }}>
                <Input
                  inputProps={{
                    accept: '.geojson',
                    type: 'file',
                    name: 'stops-geojson',
                  }}
                  inputRef={this.stopsUploadInput}
                />
                <Tooltip title="Submit">
                  <IconButton
                    key="check"
                    aria-label="Submit"
                    color="inherit"
                    size="small"
                    type="submit"
                  >
                    <Icon
                      name="checkmark"
                      size="xlarge"
                      fill="#000"
                    />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Cancel">
                  <IconButton
                    key="close"
                    aria-label="Cancel"
                    color="inherit"
                    size="small"
                    onClick={this.onUploadStopsCancel}
                  >
                    <Icon
                      name="close"
                      size="xlarge"
                      fill="#000"
                    />
                  </IconButton>
                </Tooltip>
              </span>
            </form>
          ) : (
            <Button variant="contained" onClick={this.onUploadStopsClick}>
              <Icon
                name="upload"
                fill="#000"
                size="large"
              />
              <span style={{ marginLeft: '0.5rem' }}>Upload Stops GeoJSON</span>
            </Button>
          )
        }
        {
          this.state.showLoopsUpload ? (
            <form onSubmit={this.onUploadLoopsSubmit}>
              <span style={{ display: 'flex', flexDirection: 'row' }}>
                <Input
                  inputProps={{
                    accept: '.geojson',
                    type: 'file',
                    name: 'loops-geojson',
                  }}
                  inputRef={this.loopsUploadInput}
                />
                <Tooltip title="Submit">
                  <IconButton
                    key="check"
                    aria-label="Submit"
                    color="inherit"
                    size="small"
                    onClick={this.onUploadLoopsSubmit}
                  >
                    <Icon
                      name="checkmark"
                      size="xlarge"
                      fill="#000"
                    />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Cancel">
                  <IconButton
                    key="close"
                    aria-label="Cancel"
                    color="inherit"
                    size="small"
                    type="submit"
                  >
                    <Icon
                      name="close"
                      size="xlarge"
                      fill="#000"
                    />
                  </IconButton>
                </Tooltip>
              </span>
            </form>

          ) : (
            <Button variant="contained" onClick={this.onUploadLoopsClick}>
              <Icon
                name="upload"
                fill="#000"
                size="large"
              />
              <span style={{ marginLeft: '0.5rem' }}>Upload Loops GeoJSON</span>
            </Button>
          )
        }
        {this.state.fetching
          ? <CircularProgress />
          : (
            <Snackbar
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
              }}
              autoHideDuration={6000}
              ContentProps={{
                'aria-describedby': 'message-id',
              }}
              message={<span id="message-id">Note archived</span>}
              action={[
                <IconButton
                  key="close"
                  aria-label="Close"
                  color="inherit"
                >
                  <Icon
                    name="close"
                    size="medium"
                    fill="#000"
                  />
                </IconButton>,
              ]}
            />
          )
        }
      </Fragment>
    );
  }
}

export default EditGeometry;

import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import MuiDialogTitle from '@material-ui/core/DialogTitle';
import MuiDialogContent from '@material-ui/core/DialogContent';
import TextField from '@material-ui/core/TextField';
import AddIcon from '@material-ui/icons/Add'
import MuiDialogActions from '@material-ui/core/DialogActions';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import Typography from '@material-ui/core/Typography';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';


const styles = (theme) => ({
  root: {
    margin: 0,
    padding: theme.spacing(2),
  },
  closeButton: {
    position: 'absolute',
    right: theme.spacing(1),
    top: theme.spacing(1),
    color: theme.palette.grey[500],
  },
});

const DialogTitle = withStyles(styles)((props) => {
  const { children, classes, onClose, ...other } = props;
  return (
    <MuiDialogTitle disableTypography className={classes.root} {...other}>
      <Typography variant="h6">{children}</Typography>
      {onClose ? (
        <IconButton aria-label="close" className={classes.closeButton} onClick={onClose}>
          <CloseIcon />
        </IconButton>
      ) : null}
    </MuiDialogTitle>
  );
});

const DialogContent = withStyles((theme) => ({
  root: {
    padding: theme.spacing(2),
  },
}))(MuiDialogContent);

const DialogActions = withStyles((theme) => ({
  root: {
    margin: 0,
    padding: theme.spacing(1),
  },
}))(MuiDialogActions);

export default class CustomizedDialogs extends Component {
  constructor(props) {
    super(props)
    this.state = {
      open: false,
    }
  }

  handleToggle = () => {
    this.setState({
      open: !this.state.open,
      task: {
        text: '',
        columnAddedTo: ''
      }
    })
  };

  handleChange = (prop) => ({ target: { value } }) => {
    this.setState({
      task: {
        ...this.state.task,
        [prop]: value
      }
    })
  }
  handleSubmit = () => {
    this.props.onCreateTask(this.state.task)
    this.handleToggle()
  }
  render() {
    return (
      <div>
        <Button variant="contained" color="secondary" onClick={this.handleToggle}>
          <AddIcon />
        </Button>
        <Dialog onClose={this.handleToggle} aria-labelledby="customized-dialog-title" open={this.state.open}>
          <DialogTitle id="customized-dialog-title" onClose={this.handleToggle}>
            Add a task
        </DialogTitle>
          <DialogContent dividers>
            <form>
              <TextField
                autoFocus
                multiline
                rows="3"
                margin="dense"
                required 
                id="text"
                label="Task"
                onChange={this.handleChange('text')}
              />
              <br />
              <FormControl>
                <InputLabel required id="ColumnID" >Progress</InputLabel>
                <Select
                  style={{ minWidth: 120 }}
                  id="columnAddedTo"
                  onChange={this.handleChange('columnAddedTo')}
                >
                  <MenuItem value={'Col1'}>To Do</MenuItem>
                  <MenuItem value={'Col2'}>In Progress</MenuItem>
                  <MenuItem value={'Col3'}>Done</MenuItem>
                </Select>
              </FormControl>
            </form>
          </DialogContent>
          <DialogActions>
            <Button autoFocus onClick={this.handleSubmit} color="primary">
              <AddIcon />
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    )
  }
}
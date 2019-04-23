import React from "react";
import { render } from "react-dom";
import { makeData } from "../data/data";
import ReactTable from "react-table";
import "react-table/react-table.css";
import { Fab, Typography, TextField, Toolbar, Divider, Button, IconButton, MenuItem, Icon} from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import SchoolIcon from '@material-ui/icons/School';
import SaveIcon from '@material-ui/icons/Save';

const currencies = [
    {
        value: 'USD',
        label: '$',
    },
    {
        value: 'EUR',
        label: '€',
    },
    {
        value: 'BTC',
        label: '฿',
    },
    {
        value: 'JPY',
        label: '¥',
    },
];


class Assets extends React.Component {
  constructor() {
    super();
    this.state = {
      assets: makeData(),
      tassets: 0,
      currency: 'USD'
    };
    this.renderEditable = this.renderEditable.bind(this);
    this.handleAdd = this.handleAdd.bind(this);
  }
  handleAdd() {
    let rows = this.state.assets;
    rows.push({name: "Asset " + (rows.length + 1), interest: 0, amount: 0});
    this.setState({assets: rows})
    console.log(this.state.assets);
  }

  handleSend() {
    console.log(this.state.assets);
  }

  renderEditable(cellInfo) {
    return (
      <div
        style={{ backgroundColor: "#fafafa", textAlign: "center"}}
        contentEditable
        suppressContentEditableWarning
        onBlur={e => {
          const data = [...this.state.assets];
          data[cellInfo.index][cellInfo.column.id] = e.target.innerHTML;
          this.setState({ data });
        }}
        dangerouslySetInnerHTML={{
          __html: this.state.assets[cellInfo.index][cellInfo.column.id]
        }}
      />
    );
  }
  render() {
    const { assets } = this.state;
    return (
      <div>
          <Toolbar style={{borderBottom: `1px solid`}}>
              <IconButton>
                  <SchoolIcon />
              </IconButton>
              <Typography
                  component="h3"
                  variant="h4"
                  color="inherit"
                  align="left"
                  noWrap
                  style={{flex: 1}}
              >
                  NetBook
              </Typography>
              <TextField
                  id="outlined-select-currency"
                  select
                  label="Select"
                  style={{width: 200}}
                  value={this.state.currency}
                  //onChange={this.handleChange('currency')}
                  SelectProps={{
                      MenuProps: {
                      },
                  }}
                  helperText="Please select your currency"
                  margin="normal"
                  variant="outlined"
              >
                  {currencies.map(option => (
                      <MenuItem key={option.value} value={option.value}>
                          {option.label}
                      </MenuItem>
                  ))}
              </TextField>
          </Toolbar>
          <br/>
          <Typography variant="h6" gutterBottom style={{left: 50, position: 'relative'}}>
              Assets
          </Typography>
        <ReactTable
          data={assets}
          //showPagination={false}
          columns={[
            {
              Header: "Cash, Investments, & Assets",
              accessor: "name",
              Cell: this.renderEditable
            },
            {
              Header: "Interest Rate (%)",
              accessor: "interest",
              Cell: this.renderEditable
            },
            {
              Header: "$",
              id: "amount",
              Cell: this.renderEditable
            }
          ]}
          defaultPageSize={assets.length}
          className="-striped -highlight"
        />
        <br />
        <br />
        <Fab color="primary" aria-label="Add" onClick={(e) => this.handleAdd(e)} style={{float: 'right', position: 'relative'}}>
          <AddIcon />
        </Fab>
        <div>
          <TextField
              id="outlined-full-width"
              label="Your total Assets"
              style={{ margin: 10, position: 'relative'}}
              //placeholder="$0"
              value={"$" + this.state.tassets}
              fullWidth
              margin="normal"
              variant="outlined"
              InputLabelProps={{
                  shrink: true,
              }}
          />
        </div>
        <Divider/>
        <div>
          <Button variant="contained" color="primary" onClick={(e) => this.handleSend(e)} style={{float: 'right', right: 10, top: 10, position: 'relative'}}>
              <SaveIcon/>
              Send
          </Button>
        </div>
      </div>
    );
  }
}

export default Assets;

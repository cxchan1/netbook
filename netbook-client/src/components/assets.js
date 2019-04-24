import React from "react";
import { render } from "react-dom";
import { makeAsset, makeDebt, stringifyFormData, convertArray, convertAssets, convertDebts } from "../data/data";
import ReactTable from "react-table";
import "react-table/react-table.css";
import { Fab, Typography, TextField, Toolbar, Divider, Button, IconButton, MenuItem, Icon} from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import DeleteIcon from '@material-ui/icons/Delete';
import SchoolIcon from '@material-ui/icons/School';
import SaveIcon from '@material-ui/icons/Save';

const currencies = [
    {
        value: 'USD',
        label: 'USD',
    },
    {
        value: 'EUR',
        label: 'EUR',
    },
    {
        value: 'CAD',
        label: 'CAD',
    },
    {
        value: 'JPY',
        label: 'JPY',
    },
    {
        value: 'AUD',
        label: 'AUD',
    },
    {
        value: 'MXN',
        label: 'MXN',
    },
    {
        value: 'GBP',
        label: 'GBP',
    },
    {
        value: 'SGD',
        label: 'SGD',
    },
    {
        value: 'INR',
        label: 'INR',
    },
    {
        value: 'THB',
        label: 'THB',
    },
];

const API = 'http://localhost:3000/api'
const API2 = 'http://localhost:3000/api/currency'

class Assets extends React.Component {
  constructor() {
    super();
    this.state = {
      assets: makeAsset(),
      debts: makeDebt(),
      tassets: 0,
      tdebts: 0,
      networth: 0,
      tliabilities: 0,
      currency: 'USD'
    };
    this.renderAssetsEditable = this.renderAssetsEditable.bind(this);
    this.renderDebtsEditable = this.renderDebtsEditable.bind(this);
    this.handleAddAsset = this.handleAddAsset.bind(this);
    this.handleAddDebt = this.handleAddDebt.bind(this);
    this.handleSend = this.handleSend.bind(this);
    this.handleChange = this.handleChange.bind(this);

  }
  handleAddAsset() {
    let rows = this.state.assets;
    rows.push({name: "Asset " + (rows.length + 1), interest: 0, amount: 0});
    this.setState({assets: rows})
  }
  handleAddDebt() {
    let rows = this.state.debts;
    rows.push({name: "Debt " + (rows.length + 1), interest: 0, monthly: 0, amount: 0});
    this.setState({debts: rows})
  }
  handleRemove(status) {
    if (status) {
      let assets = this.state.assets
      if (assets.length >= 1) {
        assets.pop();
        this.setState({assets: assets})
      }
    } else {
      let debts = this.state.debts
      if (debts.length >= 1) {
        debts.pop();
        this.setState({debts: debts})
    }
  }
}

  handleChange = name => event => {
    const oldCurr = this.state.currency;
    this.setState({ [name]: event.target.value });

    fetch(API2, {
      method: 'POST',
      headers: {
        'Access-Control-Allow-Origin' : '*',
        "Content-type": "application/json"
      },
      body: JSON.stringify({
      assets: convertArray(this.state.assets),
      liabilities: convertArray(this.state.debts),
      monthly: [1,2,3,4,5],
      from: oldCurr + "/" + event.target.value
    }),
  }).then(response => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error('Something went wrong ...');
        }
      })
      .then(response => this.setState({ assets: convertAssets(response.assets, this.state.assets),
                                        debts: convertDebts(response.liabilities, response.monthly, this.state.debts)
      }))
      .catch(error => console.error(error));
  };

  handleSend() {
    return fetch(API, {
      method: 'POST',
      headers: {
        'Access-Control-Allow-Origin' : '*',
        "Content-type": "application/json"
      },
      body: JSON.stringify({
      assets: convertArray(this.state.assets),
      liabilities: convertArray(this.state.debts)
    }),
  }).then(response => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error('Something went wrong ...');
        }
      })
      .then(response => this.setState({ tassets: response.totalAssets, tdebts: response.totalLiabilities, networth: response.totalNetWorth }))
      .catch(error => console.error(error));

    //let totalAssets =JSON.parse(result);
    //console.log(result);
    //this.setState({tassets: totalAssets.totalAssets})
  //   fetch(API, {
  //     method: 'POST',
  //     body: JSON.stringify({
  //     assets: [1,2,3],
  //     liabilities: []
  //   }),
  //   // headers: {
  //   //   "Content-type": "application/json; charset=UTF-8"
  //   // }
  // })
  //   .then(response => console.log('Yes:', response.json()))
  //   .catch(error => console.error('Error:', error))
  //   .then(response => console.log('Success:', JSON.stringify(response)));
  }
  renderAssetsEditable(cellInfo) {
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
  renderDebtsEditable(cellInfo) {
    return (
      <div
        style={{ backgroundColor: "#fafafa", textAlign: "center"}}
        contentEditable
        suppressContentEditableWarning
        onBlur={e => {
          const data = [...this.state.debts];
          data[cellInfo.index][cellInfo.column.id] = e.target.innerHTML;
          this.setState({ data });
        }}
        dangerouslySetInnerHTML={{
          __html: this.state.debts[cellInfo.index][cellInfo.column.id]
        }}
      />
    );
  }
  render() {
    const { assets, debts } = this.state;
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
              <TextField id="standard-name" label="Your Total NetWorth" style={{top: -2, margin: 5, position: 'relative', width: 200}} value={"$" + this.state.networth}/>
              <TextField
                  id="outlined-select-currency"
                  select
                  label="Select"
                  style={{width: 200}}
                  value={this.state.currency}
                  onChange={this.handleChange('currency')}
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
          <Typography variant="h6" gutterBottom style={{left: 50, position: 'relative', color: 'green'}}>
              Assets
          </Typography>
        <ReactTable
          data={assets}
          pageSize={this.state.assets.length}
          showPagination={false}
          columns={[
            {
              Header: "Cash, Investments, & Assets",
              accessor: "name",
              Cell: this.renderAssetsEditable
            },
            {
              Header: "Interest Rate (%)",
              accessor: "interest",
              Cell: this.renderAssetsEditable
            },
            {
              Header: this.state.currency,
              id: "amount",
              Cell: this.renderAssetsEditable
            }
          ]}
          defaultPageSize={this.state.assets.length}
          className="-striped -highlight"
        />
        <br />
        <br />
        <Fab color="primary" aria-label="Add" onClick={(e) => this.handleAddAsset(e)} style={{float: 'right', margin: 2.5, position: 'relative'}}>
          <AddIcon />
        </Fab>
        <Fab color="secondary" aria-label="Delete" onClick={() => this.handleRemove(true)} style={{float: 'right', margin: 2.5, position: 'relative'}}>
          <DeleteIcon />
        </Fab>
        <div>
          <TextField
              id="outlined-full-width"
              label="Your Total Assets"
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
        <br />
        <Typography variant="h6" gutterBottom style={{left: 50, position: 'relative', color: "red"}}>
            Liabilities
        </Typography>
      <ReactTable
        data={debts}
        pageSize={this.state.debts.length}
        showPagination={false}
        columns={[
          {
            Header: "Short Term & Long Term Debts",
            accessor: "name",
            Cell: this.renderDebtsEditable
          },
          {
            Header: "Monthly Payment",
            accessor: "monthly",
            Cell: this.renderDebtsEditable
          },
          {
            Header: "Interest Rate (%)",
            accessor: "interest",
            Cell: this.renderDebtsEditable
          },
          {
            Header: this.state.currency,
            id: "amount",
            Cell: this.renderDebtsEditable
          }
        ]}
        defaultPageSize={debts.length}
        className="-striped -highlight"
      />
      <br />
      <br />
      <Fab color="primary" aria-label="Add" onClick={(e) => this.handleAddDebt(e)} style={{float: 'right', position: 'relative'}}>
        <AddIcon />
      </Fab>
      <Fab color="secondary" aria-label="Delete" onClick={() => this.handleRemove(false)} style={{float: 'right', margin: 2.5, position: 'relative'}}>
        <DeleteIcon />
      </Fab>
      <div>
        <TextField
            id="outlined-full-width"
            label="Your Total Liabilties"
            style={{ margin: 10, position: 'relative'}}
            //placeholder="$0"
            value={"$" + this.state.tdebts}
            fullWidth
            margin="normal"
            variant="outlined"
            InputLabelProps={{
                shrink: true,
            }}
        />
      </div>
      <Divider/>
      <br/>
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

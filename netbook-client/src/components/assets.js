import React from "react";
import { render } from "react-dom";
import { makeData } from "../data/data";
import ReactTable from "react-table";
import "react-table/react-table.css";
import Fab from '@material-ui/core/Fab';
import AddIcon from '@material-ui/icons/Add';

const styles = theme => ({
  fab: {
    margin: theme.spacing.unit,
  },
  extendedIcon: {
    marginRight: theme.spacing.unit,
  },
});

class Assets extends React.Component {
  constructor() {
    super();
    this.state = {
      data: makeData()
    };
    this.renderEditable = this.renderEditable.bind(this);
  }
  handleClick() {
    console.log('this is:', this);
  }
  renderEditable(cellInfo) {
    return (
      <div
        style={{ backgroundColor: "#fafafa", textAlign: "center"}}
        contentEditable
        suppressContentEditableWarning
        onBlur={e => {
          const data = [...this.state.data];
          data[cellInfo.index][cellInfo.column.id] = e.target.innerHTML;
          this.setState({ data });
        }}
        dangerouslySetInnerHTML={{
          __html: this.state.data[cellInfo.index][cellInfo.column.id]
        }}
      />
    );
  }
  render() {
    const { data } = this.state;
    return (
      <div>
        <h3>Assets</h3>
        <ReactTable
          data={data}
          showPagination={false}
          columns={[
            {
              Header: "Cash and Investments",
              accessor: "name",
              Cell: this.renderEditable
            },
            {
              Header: "Interest Rate (%)",
              accessor: "interest",
              Cell: this.renderEditable
            },
            {
              Header: "",
              id: "amount",
              Cell: this.renderEditable
            }
          ]}
          defaultPageSize={data.length}
          className="-striped -highlight"
        />
        <br />
        <br />
        <Fab color="primary" aria-label="Add" onClick={(e) => this.handleClick(e)} style={{right: 0, position: 'absolute'}}>
          <AddIcon />
        </Fab>
      </div>
    );
  }
}

export default Assets;

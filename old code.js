// console.log(this.props, "props for mySidePanel")
if (Object.keys(this.props.info).length !== 0) {
  return (
    <div data-toggle='validator' className="sidepanel background--faint">
        <h2 className="push-double--bottom sp-headbig">TAG DETAILS</h2>
          <div className="flex">
          {this.state.info.logo ?
              <div> <img className='sidepanel-logo' src={this.state.info.logo}/> </div>
            :
              <div> <img className='sidepanel-logo' src="images/custom.png"/> </div>
          }
          <div className='flex flex-v-center'>
              <div className = 'sidepanel-displayname'> {this.state.info.displayName} </div>
          </div>
          </div>
          <div className='sd-headsmall deschead'> DESCRIPTION </div>
            <div className='tagdesc'>{this.state.info.tagDescription}</div>
            <label className="label label--rule">
            </label>
            {this.props.info.name === "custom" ?
              <div>
                <button className="btn-uniform-add button button--highlight" onClick={this.openModal}> Edit Custom Code</button>

                <Modal
                  isOpen={this.state.modalIsOpen}
                  onAfterOpen={this.afterOpenModal}
                  onRequestClose={this.closeModal}
                  style={customStyles} >

                  <h2 ref="subtitle">Update Custom Tag</h2>
                  <div className='modaltext'>
                    <div> Please update your Javascript code here. </div>
                    <div className="editor">
                      <AceEditor
                        className="editablecustom"
                        mode="javascript"
                        theme="tomorrow"
                        name="editablecustom"
                        height="120px"
                        width="620px"
                        editorProps={{$blockScrolling: true}}
                        value={this.state.changes}
                        onChange={this.onChangeSnippet}
                      />
                    </div>
                  </div>
                  <div className='flex space-between'>
                    <button className="button button--highlight" onClick={this.updateCustom}> Update Custom Tag </button>
                    <button className="button button--highlight" onClick={this.closeModal}> Cancel </button>
                  </div>
                </Modal>
              </div>
              :
              <div> </div>
            }
          {splicedTokenField.map(function(field, item) {
            var err = this.state.errors[field.name];
            return <MyInputFields key={item} error={err || false} field={field} value={this.state.fields[item].value} onChange={this.onChangeTokens.bind(this, item)}/>
          }.bind(this))}
            <div className="flex">
               <div className="flex--1 sd-headsmall"> Called On: </div>
            </div>
        <select className="form-control" name='trackingTrigger' onChange={this.onChange}>
              {this.state.triggerOptions.map((trigger) => {
                if (trigger === this.state.info.trackingTrigger) {
                  return <option value={trigger} selected> {trigger} </option>
                }
                return <option value={trigger} >{trigger}</option>
                })
              }
          </select>
        <div className="flex togglebutton">
          {this.state.info.active === true ?
              <div>
                <button className="button button--highlight" name='active' onClick={this.onChange}>Enabled</button>
                <button className="button" name='active' onClick={this.onChange}>Disabled</button>
              </div>
           :
              <div>
                <button className="button" name='active' onClick={this.onChange}>Enabled</button>
                <button className="button button--highlight" name='active' onClick={this.onChange}>Disabled</button>
              </div>
            }
        </div>
        <div>
          <button className="btn-uniform-add button button--highlight" onClick={this.onUpdate}>Update Tag</button>
        </div>
        <div>
          <button className="btn-uniform-del button button--highlight" onClick={this.onDelete}>Delete</button>
        </div>

    </div>
  )
}

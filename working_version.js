render: function () {
  return (
    <div className="form-group newTemplate">
     <div className="form-group">
       <div className="flex--1 sd-headsmall">Enter a name for snippet (please do not include spaces):</div>
       <input type="text" className="text-input width--200 text-input-styled" name='type' onChange={this.onChange}/>
     </div>
     <div className="form-group">
       <div className="flex--1 sd-headsmall">Enter display name for snippet:</div>
       <input type="text" className="text-input width--200 text-input-styled" name='displayName' onChange={this.onChange}/>
     </div>
     <div className="form-group">
       <div className="flex--1 sd-headsmall">Enter description for snippet:</div>
       <input type="text" className="text-input width--200 text-input-styled" name='description' onChange={this.onChange}/>
     </div>
     <button onClick={this.onAddField} className="btn-uniform-add button button--highlight" id='addField'>Add field</button>

     <div>
       {
        this.state.fields.map((item, index) => {

           var tokenHere;
           var token = '{{' + item.tokenName.replace(/ /g, '_') + '}}';
           if (item.tokenName) {
             tokenHere = <div name='token' value={token} onChange={this.onChangeFields}>Your field token name is <code>{token}</code></div>
           } else {
             tokenHere = null;
           }
           if (this.state.errors[index]) {
             var errName = this.state.errors[index]['tokenName'] || null;
             var errDescription = this.state.errors[index]['tokenDescription'] || null;
           }
           return (
             <div>
               <div className="form-group">
                 <div className="flex--1 sd-headsmall">Enter a field name:</div>
                 <input type="text" value={item.tokenName} onChange={this.onChangeFields.bind(this, index)} className={`text-input width--200 text-input-styled`} name='tokenName'/>
                {(errName) ? <div className='warning'>{errName}</div> : null }
               </div>
               {tokenHere}
               <div className="form-group">
                 <div className="flex--1 sd-headsmall">Enter a field display description:</div>
                 <input type="text" value={item.tokenDescription} onChange={this.onChangeFields.bind(this, index)} className="text-input width--200 text-input-styled" name='tokenDescription' />
                {(errDescription) ? <div className='warning'>{errDescription}</div> : null }
             </div>
               <button onClick={this.onDeleteField.bind(this, index)} className="btn-uniform-add button button--highlight">Delete</button>
             </div>
          )
        })
       }
     </div>

     <div className="form-group">
       <div className="flex--1 sd-headsmall">Does your snippet natively take any callbacks?</div>
       <select className="form-control" name='hasCallback' onChange={this.onChange}>
        <option value={true}>Yes</option>
          <option value={false}>No</option>

       </select>
       <div>{(this.state.hasCallback === 'true') ? <div>Please put <code>{"{{{...}}}"}</code> around your callback</div> : null}</div>
     </div>

     {(this.state.hasCallback === 'false') ?
        (<div className="form-group">
         <div className="flex--1 sd-headsmall">Would you like us to make your code callbackable?</div>
         <select className="form-control" name='usesOurCallback' onChange={this.onChange}>
          <option value={false}>No</option>
            <option value={true}>Yes</option>

         </select>
       </div>) : null
    }

    {(this.state.usesOurCallback === 'true') ?
    (<div>
      <div className="form-group">
       <div className="flex--1 sd-headsmall">What is the name of your tag we should be checking for:</div>
       <input type="text" className="text-input width--200 text-input-styled" name='checkFor' onChange={this.onChange} />
     </div>
    <div className="form-group">
       <div className="flex--1 sd-headsmall">What type is your tag when it is ready?</div>
       <select className="form-control" name='checkForType' onChange={this.onChange}>
         <option value={'function'}>function</option>
         <option value={'object'}>object</option>
       </select></div>
    </div>) : null
    }

     <div className="form-group">
       <div className="flex--1 sd-headsmall">Enter your code</div>
       <div className="editor">
         <AceEditor
           className="editor text-input width--200 text-input-styled"
           mode="javascript"
           theme="tomorrow"
           height="100px"
           width="1000px"
           id="comment"
           editorProps={{$blockScrolling: true}}
           value={this.state.template}
           onChange={this.onChangeSnippet}
         />
      </div>
     </div>
     <div className="form-group">
       <div className="flex--1 sd-headsmall">Enter your email:</div>
       <input type="text" className="text-input width--200 text-input-styled" name='email' value={this.state.email} onChange={this.onChange}/>
     </div>
     <button type="submit" onClick={this.onSubmit} className="submitButton btn-uniform-add button button--highlight">Submit</button>
           <input type="text" className="text-input text-input--search width--200"/>
    </div>
  )
}

class App extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            'total_amount':1000,
            'amount':100,
            'email':'',
        }
    }
    async componentDidMount(){
        const result = await axios.get('/get_total_amount');
        console.log(result.data["0"].total_amount);
        this.setState({total_amount:result.data["0"].total_amount})
    }
    handleChange = (event)=>{
        this.setState({[event.target.name]:event.target.value})
        console.log(this.state.email);
    }
    onSubmitChange = async (event) =>{
        event.preventDefault();
        const response = await axios.post('/post_info',{
            amount:this.state.amount,
            email:this.state.email
        });
        console.log(response);
    }

    render(){
        return (
            <div>
                <h1>Lottery application</h1>
                <div>
                    <p>Total Lottery Amount is {this.state.total_amount}</p>
                </div>
                <form onSubmit={this.onSubmitChange}>
                    <input placeholder="amount" name="amount" value={this.state.amount} onChange={this.handleChange} />
                    <input placeholder="email" name="email" value={this.state.email} onChange={this.handleChange} />
                    <button type="submit" >Participate</button>
                </form>
            </div>
        );
    }
}

ReactDOM.render(
    <div>
        <App />
    </div>
    , document.getElementById('react-binding')
);
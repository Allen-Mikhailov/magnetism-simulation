class DataLoader
{
    constructor(key, default_data)
    {
        this.key = key
        this.default_data = default_data
    }

    get_data()
    {
        return JSON.parse(localStorage.getItem(this.keykey) || JSON.stringify(this.default_data))
    }

    update_data(data)
    {
        localStorage.setItem(this.key, JSON.stringify(data))
    }
}

export default DataLoader
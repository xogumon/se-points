require("dotenv").config({ silent: true })
const express = require("express")
const axios = require("axios")
const app = express()

app.get("/", (req, res) => res.send("Hello wwworld!"))
app.get("/loyalty/:channel/:username", (req, res, next) => {
    const token = process.env.JWT ?? null
    const channel = req.params.channel
    const username = req.params.username
    if (!token) return next()
    axios({
        headers: {
            "Accept": "application/json; charset=utf-8",
            "Authorization": `Bearer ${token}`
        },
        url: `https://api.streamelements.com/kappa/v2/points/${channel}/${username}`,
    }).then(({ data }) => {
        delete data.channel
        return res.send(data)
    }).catch((_) => res.status(500).send("Booooooooom!"))
})
app.get("/loyalty/:channel/:username/:amount", (req, res, next) => {
    const token = process.env.JWT ?? null
    const channel = req.params.channel
    const username = req.params.username
    const amount = Number(req.params.amount)
    if (!token) return next()
    axios({
        method: "PUT",
        headers: {
            "Accept": "application/json; charset=utf-8",
            "Authorization": `Bearer ${token}`
        },
        url: `https://api.streamelements.com/kappa/v2/points/${channel}/${username}/${amount}`,
    }).then(({ data }) => {
        const result = {}
        result.username = data.username
        if (amount >= 0) {
            result.win = amount
        } else {
            result.lost = Math.abs(amount)
        }
        result.points = data.newAmount
        return res.send(req.query.as === "txt" ? `${result.win ? "ganhou" : "perdeu"} ${Math.abs(amount)}` : result)
    }).catch((err) => {
        console.log(err)
        res.status(500).send("Booooooooom!")
    })
})
app.listen(process.env.PORT || 8080)
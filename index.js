(async()=>{
    "use strict";

    // Dependencies
    const { runJobs } = require("parallel-park")
    const shellJS = require("shelljs")
    const fs = require("fs")
    
    // Variables
    const args = process.argv.slice(2)
    const results = {}
    
    // Main
    if(!args.length) return console.log("usage: node index.js <inputFile> <outputFile>")

    const ips = fs.readFileSync(args[0], "utf8").split("\n")

    console.log("Scanning the IPs, please wait...")
    await runJobs(
        ips,
        async(ip)=>{
            if(ip){
                const result = shellJS.exec(`nmap ${ip}`, { silent: true }).stdout
                const openPorts = result.match(/\d+\/tcp\s+open/g)
                results[ip] = {}

                if(openPorts) results[ip].ports = openPorts.map((port) => port.split(' ')[0])
            }
        },
        {
            concurrency: 50
        }
    )

    console.log("Saving the results, please wait...")
    fs.writeFileSync(args[1], JSON.stringify(results))
    console.log("Finished.")
})()
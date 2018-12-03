var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var AWS = require("aws-sdk");

AWS.config.update({region: 'us-west-2'});

var ses = new AWS.SES({ apiVersion: "2010-12-01" });

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.text())                                    
app.use(bodyParser.json({ type: 'application/json'}))  


app.get('/listIdentities', (req, res) => {
    var params = {
        IdentityType: 'Domain',
        MaxItems: 100
    };
    ses.listIdentities(params, (err, data) => {
        if(err) res.send(err);
        else res.send(data);
    });
});


app.get('/listTemplates', (req, res) => {
    var params = {
        MaxItems: 100
    };
    ses.listTemplates(params, (err, data) => {
        if(err) res.send(err);
        else res.send(data);
    });
});

app.get('/getTemplateByName/:name', (req, res) => {
    var params = {
        TemplateName: req.params.name
    };
    ses.getTemplate(params, (err, data) => {
        if(err) res.send(err);
        else res.send(data);
    });
});

app.post('/createTemplate', (req, res) => {
    var updateFlag = req.body.isUpdate;
    var params = {
        Template: {
            TemplateName: req.body.templateName,
            HtmlPart: req.body.html,
            SubjectPart: req.body.subject,
            TextPart: req.body.text
        }
    };
    if(updateFlag == true) {
        console.log('update');
        ses.updateTemplate(params, (err, data) => {
            if(err) res.send(err);
            else res.send(data);
        });    

    } else {
        ses.createTemplate(params, (err, data) => {
            if(err) res.send(err);
            else res.send(data);
        });    
    }
});

app.post('/sendEmail', (req, res) => {
    var params = {
        Destination: {
            ToAddresses: req.body.toAddresses,
            CcAddresses: req.body.ccAddresses
        },
        ConfigurationSetName: req.body.configuratonSetName,
        Message: {
            Body: {
                Text: {
                    Charset: "UTF-8",
                    Data: req.body.message
                }
            },
            Subject: {
                Charset: "UTF-8",
                Data: req.body.subject
            }
        },
        Source: req.body.source
    };

    ses.sendEmail(params, (err, data) => {
        if(err) res.send(err);
        else res.send(data);
    });
});


app.post('/sendEmailUsingTemplate', (req, res) => {
    var params = {
        Source: req.body.source,
        Destination: {
            ToAddresses: req.body.toAddresses
        },
        Template: 'MyTemplate',
        ConfigurationSetName: 'Email',
        TemplateData: req.body.templateData 
    };
    ses.sendTemplatedEmail(params, (err, data) => {
        if(err) res.send(err);
        else res.send(data);
    });
});

var server = app.listen(8080, () => {});
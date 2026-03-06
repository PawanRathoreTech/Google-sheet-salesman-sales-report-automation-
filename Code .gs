function sendSalesReports() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var listSheet = ss.getSheetByName("Sheet1");
  var dataSheet = ss.getSheetByName("Sheet2");

  var salesmen = listSheet.getDataRange().getValues();
  var data = dataSheet.getDataRange().getValues();
  var headers = data[0];

  for (var i = 1; i < salesmen.length; i++) {
    var name = salesmen[i][1];
    var email = salesmen[i][2];
    if (!name || !email) continue;

    var filtered = [headers];

    // match salesman (case-insensitive)
    for (var j = 1; j < data.length; j++) {
      if (data[j][8].toString().toLowerCase() == name.toLowerCase()) {
        filtered.push(data[j]);
      }
    }

    if (filtered.length === 1) continue;

    // temp spreadsheet create
    var tempSS = SpreadsheetApp.create("Report_" + name);
    var tempSheet = tempSS.getSheets()[0];
    tempSheet.getRange(1, 1, filtered.length, filtered[0].length).setValues(filtered);

    SpreadsheetApp.flush();

    // convert to PDF via Drive
    var file = DriveApp.getFileById(tempSS.getId());
    var pdfBlob = file.getAs("application/pdf").setName(name + "_Sales_Report.pdf");

    // send email
    MailApp.sendEmail({
      to: email,
      subject: "Your Sales Report",
      body: "Hello " + name + ",\n\nPlease find attached your sales report.",
      attachments: [pdfBlob]
    });

    // delete temp file
    DriveApp.getFileById(tempSS.getId()).setTrashed(true);
  }
}

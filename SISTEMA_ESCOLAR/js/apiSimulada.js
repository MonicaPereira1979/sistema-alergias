// apiSimulada.js
$(document).ready(() => {
  $("#btnGerar").click(() => {
    $("#saidaAPI").val(exportData());
  });
  $("#btnImportar").click(() => {
    const txt = $("#entradaAPI").val().trim();
    if (!txt) return alert('Cole o JSON para importar.');
    if (importData(txt)) {
      alert('Importação concluída.');
    }
  });
});

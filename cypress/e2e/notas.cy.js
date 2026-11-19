const aluno = "Ana Souza";

function tabela(titulo) {
  return cy.contains("h2", titulo).should("be.visible").closest("section").find("table");
}

function linhaDaNota(avaliacao) {
  return tabela("Notas lançadas").contains("tbody td", avaliacao).closest("tr");
}

function lancarNota(avaliacao, nota) {
  cy.contains("h2", "Lançamento de notas").closest("section").within(() => {
    cy.get("#alunoId").select(aluno);
    cy.get("#avaliacao").type(avaliacao);
    cy.get("#nota").type(String(nota)).should("have.value", String(nota));
    cy.contains("button", "Lançar nota").click();
  });
}

function conferirNota(avaliacao, valor) {
  linhaDaNota(avaliacao).should("be.visible").find("td").should(($celulas) => {
    expect($celulas.eq(0).text().trim(), "aluno").to.equal(aluno);
    expect($celulas.eq(1).text().trim(), "avaliação").to.equal(avaliacao);
    expect($celulas.eq(2).text().trim(), "nota").to.equal(String(valor));
  });
}

describe("Listagem de alunos e lançamento de notas", () => {
  beforeEach(() => {
    cy.visit("http://localhost:5173");
  });

  it("CT01 - exibe nome e e-mail de um aluno cadastrado", () => {
    tabela("Alunos cadastrados").contains("tbody td", aluno).closest("tr")
      .should("be.visible").within(() => {
        cy.contains("td", /^Ana Souza$/).should("be.visible");
        cy.contains("td", /^ana@email\.com$/).should("be.visible");
      });
  });

  it("CT02 - exibe o aluno recém-cadastrado com o e-mail informado", () => {
    const nome = "Beatriz Lima";
    const email = "beatriz.lima@example.com";

    cy.get('input[name="nome"]').closest("form").within(() => {
      cy.get('input[name="nome"]').type(nome);
      cy.get('input[name="email"]').type(email);
      cy.get('input[name="idade"]').type("18");
      cy.get('select[name="curso"]').select("Edificações");
      cy.contains("button", "Cadastrar aluno").click();
    });

    tabela("Alunos cadastrados").contains("tbody td", /^Beatriz Lima$/)
      .closest("tr").within(() => {
        cy.contains("td", /^Beatriz Lima$/).should("be.visible");
        cy.contains("td", /^beatriz\.lima@example\.com$/).should("be.visible");
      });
  });

  it("CT03 - cadastra e exibe a nota 8.5 para Prova 1", () => {
    const linhasDaProva = () => tabela("Notas lançadas").find("tbody tr")
      .filter((_, linha) => {
        const [nome, avaliacao, nota] = [...linha.cells].map((celula) => celula.textContent.trim());
        return nome === aluno && avaliacao === "Prova 1" && nota === "8.5";
      });

    // A aplicação já inicia com essa nota. Conferir a quantidade evita um falso positivo.
    linhasDaProva().then(($linhas) => {
      const quantidadeInicial = $linhas.length;
      lancarNota("Prova 1", 8.5);
      linhasDaProva().should("have.length", quantidadeInicial + 1);
      linhasDaProva().last().should("be.visible");
    });
  });

  it("CT04 - exibe o aluno, a avaliação e o valor cadastrados", () => {
    const avaliacao = "Trabalho de Ciências";
    lancarNota(avaliacao, 9);
    conferirNota(avaliacao, 9);
  });

  it("CT05 - impede o cadastro da nota 11", () => {
    const avaliacao = "Teste do limite de nota";
    lancarNota(avaliacao, 11);

    tabela("Notas lançadas").should(($tabela) => {
      expect($tabela.text(), "A avaliação com nota 11 não deve ser cadastrada")
        .not.to.include(avaliacao);
    });
  });

  it("CT06 - edita somente o valor da nota", () => {
    const avaliacao = "Atividade de edição";
    lancarNota(avaliacao, 6);
    conferirNota(avaliacao, 6);

    linhaDaNota(avaliacao).within(() => {
      cy.contains("button", "Editar").click();
      cy.get('input[type="number"]').should("have.value", "6").clear().type("9.5");
      cy.contains("button", "Salvar").click();
    });

    conferirNota(avaliacao, 9.5);
  });
});

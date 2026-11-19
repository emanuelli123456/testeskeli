describe("cadastro de alunos", () =>{
    it("Deve cadastrar o aluno", () => {

        // Acessar o sistema
        cy.visit("http://localhost:5173");

        //Verificar o titulo formulario
        cy.contains("Novo aluno").should("be.visible")

        //Preencher os campos
        cy.get('input[name="nome"]').type("Vini jr")

        cy.get('input[name="email"]').type("vinijr@email.com")

        cy.get('input[name="idade"]').type("26")

        cy.get('select[name="curso"]').select("Edificações")

        //verificar se os campos foram preechidos
        cy.get('input[name="nome"]').should("have.value","Vini jr")
        cy.get('input[name="email"]').should("have.value","vinijr@email.com")
        cy.get('input[name="idade"]').should("have.value","26")
        cy.get('select[name="curso"]').select("have.value","Edificações")
        
        //clicar no botao cadastrar aluno
        cy.contains("button", "Cadastrar aluno").click()


    })
})
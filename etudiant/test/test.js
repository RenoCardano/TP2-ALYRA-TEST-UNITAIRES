
const {expectRevert, expectEvent } = require('@openzeppelin/test-helpers');
const TestVoting = artifacts.require('Voting');
//require to install npm install -s bn-chai
var chai = require('chai');
const { expect } = require('chai');
var BN = require('bn.js');
var bnChai = require('bn-chai');
chai.use(bnChai(BN));

contract('Voting Contract Test Suite', accounts => {

    const owner = accounts[0];
    const voter1 = accounts[1];
    const voter2 = accounts[2];
    const voter3 = accounts[3];

    let proposal1 = 'proposal1';
    let proposal2 = 'proposal2';
    let proposal3 = 'proposal3';


     function buildNewInstance() {
        return TestVoting.new({ from: owner });
    }


    /**
     * Before to start let's test basics functionnalities
     * and correct instance building
     */

      describe('Testing basics function', function () {
        it('should be valid to test mechanism', () => {
            expect(true).to.be.true;
        });

        it('should create a new contract instance', async () => {
            const instance = await buildNewInstance();
            expect(instance.address).to.be.not.null;
        });
     });


     describe("Tests related to the deployement of the contract at the right address", async function (){

        let instance;

        before(async () => {
            instance = await buildNewInstance();
        });

        //assess is deploy contract address is Owner
        it("Should match the owner address", async function () {
        expect(await instance.owner()).to.equal(owner);
        });

        it("Should NOT match the voter1 address", async function () {
        expect(await instance.owner()).not.to.equal(voter1);
            });
    });

    describe('Testing gaz estimation needed to deploy the contract', function () {
   
        it("...should deploy and successfully call createInstance using the method's provided gas estimate", async () => {
       
        const amountOfGas = await TestVoting.new.estimateGas({from:owner});
        assert(amountOfGas);
        console.log(amountOfGas);

      });
    });
    
 


    describe('Tests related to the function getVoter()', async function () {
      
        let instance;

        before(async () => {
            instance = await buildNewInstance();
        });

        it('should require 1 parameter', async () => {
            await expectRevert(instance.getVoter(), 'Invalid number of parameters for "getVoter". Got 0 expected 1!');
        });
        it('should require an address as parameter', async () => {
            await expectRevert(instance.getVoter('test'), 'invalid address (argument="address", value="test", code=INVALID_ARGUMENT, version=address/5.0.5) (argument="_addr", value="test", code=INVALID_ARGUMENT, version=abi/5.0.7)' );
        });
        it('should require a voter to be register to call the function because of onlyVoters modifier', async () => {
            await expectRevert(instance.getVoter(voter1, {from: voter1}), "You're not a voter" );
        });
        it('should return be able to call the function when voter registered by owner => isRegistered: true , hasVoted: false, votedProposalId: 0', async () => {
            await instance.addVoter(voter1, {from: owner})
            let responseData = await instance.getVoter(voter1, {from: voter1});
            const {0: isRegistered, 1: hasVoted, 2: votedProposalId} = responseData;
    
            expect(isRegistered).to.be.equal(true);
            expect(hasVoted).to.be.equal(false);
            expect(votedProposalId).to.be.equal('0');
        });

        it('should return false to isRegister for voter 2 => isRegistered: false , hasVoted: false, votedProposalId: 0', async () => {
        
            let responseData = await instance.getVoter(voter2, {from: voter1});
            const {0: isRegistered, 1: hasVoted, 2: votedProposalId} = responseData;
    
            expect(isRegistered).to.be.equal(false);
            expect(hasVoted).to.be.equal(false);
            expect(votedProposalId).to.be.equal('0');
        });

    });

    

    describe('Test related to the REGISTRATION process => addVoter()', async function (){

        let instance;

        before(async () => {
            instance = await buildNewInstance();
            await instance.addVoter(voter1, {from: owner});
        
        });

        it('should require 1 parameter', async () => {
            await expectRevert(instance.addVoter(), 'Invalid number of parameters for "addVoter". Got 0 expected 1!');
        });
        it('should require an address as parameter', async () => {
            await expectRevert(instance.addVoter('test'), 'invalid address (argument="address", value="test", code=INVALID_ARGUMENT, version=address/5.0.5) (argument="_addr", value="test", code=INVALID_ARGUMENT, version=abi/5.0.7)' );
        });
      
        it('should be call be owner', async () => {
            await expectRevert(instance.addVoter(voter2, {from: voter1}), "Ownable: caller is not the owner." );
        });

        it('should has registered voter 1', async () => {
            await instance.getVoter(voter1, {from: voter1}).then(function(response) { reponseInstance = response});
            const {0: isRegistered} = reponseInstance;
            expect(isRegistered).to.equal(true);
        });

        it('should NOT be able to autorise a second time voter 1 from owner', async () => {
            await expectRevert(instance.addVoter(voter1, {from: owner}), 'Already registered');
        });

      
        it('should not register voter 2 when having register voter 1', async () => {
            await instance.getVoter(voter2, {from: voter1}).then(function(response) { reponseInstance = response});
            const {0: isRegistered} = reponseInstance;
            expect(isRegistered).to.equal(false);
        });

         it('should emit "VoterRegistered" events', async () => {
            let responseData = await instance.addVoter(voter2, {from: owner});
            expectEvent(responseData, 'VoterRegistered');
            });  

        it('should revert an error if stage NOT RegisteringVoters', async () => {
            await instance.startProposalsRegistering({from: owner});
            await expectRevert(instance.addVoter(voter3, {from: owner}), 'Voters registration is not open yet');
        });
    });


        describe('Test related to the PROPOSAL process:  getOneProposal() ', async function () {
            
            let instance;

            before(async () => {
                instance = await buildNewInstance();
                await instance.addVoter(voter1, {from:owner});
                await instance.startProposalsRegistering({from : owner});
            });
    
            it('should return proposal1 made by voter 1 and id', async function () {;
                let newProposal = await instance.addProposal('proposal1', {from: voter1});
                await instance.getOneProposal(0, {from: voter1}).then(function(response) { data = response});
                const {0: description,1: voteCount} = data;
                expect(description).to.equal('proposal1');
                expect(voteCount).to.equal('0');
            });

            it('should require to be a voter, voter 2 NOT registered : getOneProposal()', async function () {
                await expectRevert(instance.getOneProposal(0, {from:voter2}), "You're not a voter");
            });
        });


    describe('Test related to the PROPOSAL process:  function addProposal() and getOneProposal() ', async function () {
      
        let instance;

        before(async () => {
            instance = await buildNewInstance();
            await instance.addVoter(voter1, {from:owner});
            await instance.startProposalsRegistering({from : owner})
        });

        it('should require to be a voter', async function() {
            await expectRevert(instance.addProposal({from:voter2}), "You're not a voter");
        });

        it('should require 1 string parameter NOT an empty string', async function() {
            await expectRevert(instance.addProposal("", {from:voter1}), 'Vous ne pouvez pas ne rien proposer');
        });

        it('should add proposal 1 to voter 1 && emit ProposalRegistered event and id = 0', async function () {;
            let newProposal = await instance.addProposal('proposal1', {from: voter1});
            await instance.getOneProposal(0, {from: voter1}).then(function(response) { data = response});
            const {0: string} = data;
            expect(string).to.equal('proposal1');
            expectEvent(newProposal, 'ProposalRegistered', {proposalId : new BN(0) } );
        });

    });

   

    describe('Tests related to the workflows', async function () {

        let instance;

        before(async () => {
            instance = await buildNewInstance();
        });

  
        it("WorkflowStatus should change from 0 to 1 and emit WorkflowStatusChange ", async function() {
            let event = await instance.startProposalsRegistering({from:owner});
            let defaultstate = await instance.workflowStatus();
            expect(await defaultstate.words[0]).to.equal(1);
           await expectEvent(event, 'WorkflowStatusChange');
        });

      it("WorkflowStatus should change from 1 to 2 and emit WorkflowStatusChange", async function() {
            let event = await instance.endProposalsRegistering({from:owner});
            let defaultstate = await instance.workflowStatus();
            expect(await defaultstate.words[0]).to.equal(2);
            await expectEvent(event, 'WorkflowStatusChange');
        });

        it("WorkflowStatus should change from 2 to 3 and emit WorkflowStatusChange", async function() {
            let event = await instance.startVotingSession({from:owner});
            let defaultstate = await instance.workflowStatus();
            expect(await defaultstate.words[0]).to.equal(3);
            await expectEvent(event, 'WorkflowStatusChange');
        });

        it("WorkflowStatus should change from 3 to 4 and emit WorkflowStatusChange", async function() {
            let event = await instance.endVotingSession({from:owner});
            let defaultstate = await instance.workflowStatus();
            expect(await defaultstate.words[0]).to.equal(4);
            await expectEvent(event, 'WorkflowStatusChange');
        });
  
    });
  
    describe('Tests related to the Voting process', async function(){

        let instance;

        before(async () => {
            instance = await buildNewInstance();
            await instance.addVoter(voter1, {from: owner});
            await instance.addVoter(voter2, {from: owner});
            await instance.addVoter(voter3, {from: owner})
            await instance.startProposalsRegistering({from: owner});
            await instance.addProposal(proposal1,{from: voter1})
            await instance.addProposal(proposal2,{from: voter2})
            await instance.endProposalsRegistering({from: owner});
            await instance.startVotingSession({from: owner});

        })

        it('Should expect 1 parameter', async function () {
            await expectRevert(instance.setVote(0, 0 ,{from: voter1}), 'Invalid number of parameters for "setVote". Got 3 expected 1!')
          });

        it('should put hasvoted to true when voter 1 vote has voted', async function() {
            await instance.setVote(0, {from : voter1});
            let response = await instance.getVoter(voter1, {from: voter1});
            expect(response.isRegistered).to.equal(true);
          });
 
          it('should NOT ben able to vote twice', async function() {
            await expectRevert(instance.setVote(0, {from : voter1}),'You have already voted');
          });

          it('should NOT put hasvoted to true to voter 2 if voter 2 has not voted yet', async function() {
            let response = await instance.getVoter(voter2, {from: voter2});
            expect(response.hasVoted).to.equal(false);
          });

        it('should add +1 to the proposition 2 to voter 2 structure when voter 2 vote for proposition 2', async function() {
            await instance.setVote(1, {from : voter2});
            let response = await instance.getOneProposal(1, {from: voter2});
            expect(response.voteCount).to.equal('1');
        });

        it('should trigger Voted event when voting', async function() {
           let VotedEvent = await instance.setVote(1, {from : voter3});
           expectEvent(VotedEvent,'Voted');
        });

        it('Should be called be able to vote if session over', async function () {
            await instance.endVotingSession({from:owner});
            await expectRevert(instance.setVote(0,{from: voter1}), 'Voting session havent started yet');
        });

        //ajouter un vote hors index

    });



  describe('Describe tallyVotes(), show the right winner proposition: here proposal2', async function (){

        let instance; 

        before(async () => {
            instance = await buildNewInstance();
            await instance.addVoter(voter1, {from: owner});
            await instance.addVoter(voter2, {from: owner});
            await instance.addVoter(voter3, {from: owner})
            await instance.startProposalsRegistering({from: owner});
            await instance.addProposal(proposal1,{from: voter1})
            await instance.addProposal(proposal2,{from: voter2})
            await instance.endProposalsRegistering({from: owner});
            await instance.startVotingSession({from: owner});
            await instance.setVote(0, {from: voter1});
            await instance.setVote(1, {from: voter2});
            await instance.setVote(1, {from: voter3});
            
        })

        it('should be called at stage 5 only', async function (){
            await expectRevert(instance.tallyVotes({from:owner}),'Current status is not voting session ended');
        });

        it('should tallyVotes proposal 2 => id 1', async function () {
            await instance.endVotingSession({from: owner});
            await instance.tallyVotes({from:owner});
            let winningprop = await instance.winningProposalID();
            expect(winningprop).to.eq.BN(1);
        });
    });

   /**   describe('Testing gaz estimation for all function', async function () {
       
        let amountOfGas;
        let totalAmountSpend;
        let instance;

        before(async () => {
         instance = await TestVoting.deployed();

        })
      
        it("...should deploy and successfully estimates gaz using the method's provided gas estimate", async () => {
            amountOfGas = await TestVoting.new.estimateGas({from:owner});
            console.log(amountOfGas);
            totalAmountSpend = amountOfGas;
        });

       it("...should run addvoter() and successfully estimates gaz using the method's provided gas estimate", async () => {
            await instance.addVoter(voter1, {from: owner});
            amountOfGas = await instance.addVoter.estimateGas(voter1, {from: owner});
            console.log(amountOfGas);
            totalAmountSpend += amountOfGas;
        });
   
        it("...should run startProposalsRegistering() and successfully estimates gaz  using the method's provided gas estimate", async () => {

            await instance.startProposalsRegistering({from: owner});
            amountOfGas += await instance.startProposalsRegistering.estimateGas({from: owner});
            console.log(amountOfGas);
            totalAmountSpend += amountOfGas;
        });

        it("...should run addProposal() and successfully  estimates gaz  using the method's provided gas estimate", async () => {

            await instance.addProposal(proposal1,{from: voter1})
            amountOfGas += await instance.addProposal.estimateGas(proposal1,{from: voter1});
            console.log(amountOfGas);
            totalAmountSpend += amountOfGas;
        });

        it("...should run endProposalsRegistering() and successfully estimates gaz  using the method's provided gas estimate", async () => {

            await instance.endProposalsRegistering({from: owner});
            amountOfGas += await instance.endProposalsRegistering.estimateGas({from: owner});
            console.log(amountOfGas);
            totalAmountSpend += amountOfGas;
        });

        it("...should run startVotingSession() and successfully estimates gaz  using the method's provided gas estimate", async () => {

            await instance.startVotingSession({from: owner});
            amountOfGas += await instance.startVotingSession.estimateGas({from: owner});
            console.log(amountOfGas);
            totalAmountSpend += amountOfGas;
        });

        it("...should run setVote() and successfully estimates gaz  using the method's provided gas estimate", async () => {

            await instance.setVote(0, {from: voter1});
            amountOfGas += await instance.addVoter.estimateGas(voter1, {from: owner});
            console.log(amountOfGas);
            totalAmountSpend += amountOfGas;
        });


        it("...should run endVotingSession() and successfully estimates gaz  using the method's provided gas estimate", async () => {

            await instance.endVotingSession({from: owner});
            amountOfGas += await instance.addVoter.endVotingSession({from: owner});
            console.log(amountOfGas);
            totalAmountSpend += amountOfGas;
        });

        it("...should run tallyVotes() and successfully estimates gaz  using the method's provided gas estimate", async () => {

            await instance.tallyVotes(0, {from: voter1});
            amountOfGas += await instance.tallyVotes.estimateGas(0, {from: voter1});
            console.log(amountOfGas);
            totalAmountSpend += amountOfGas;
        });

        it("...should run getVoter() and successfully estimates gaz  using the method's provided gas estimate", async () => {

            await instance.getVoter(voter1, {from: voter1});
            amountOfGas += await instance.getVoter.estimateGas(voter1, {from: voter1});
            console.log(amountOfGas);
            totalAmountSpend += amountOfGas;
        });

        it("...should run getOneProposal() and successfully estimates gaz  using the method's provided gas estimate", async () => {

            await instance.getOneProposal(0, {from: voter1});
            amountOfGas += await instance.getOneProposal.estimateGas(0, {from: voter1});
            console.log(amountOfGas);
            totalAmountSpend += amountOfGas;
        });

        it("...should print the total amount of gaz spend", async () => {

            console.log(totalAmountSpend);
        });

      

        }); 
          */
});